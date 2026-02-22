import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { gitAutoSync } from "@/lib/gitSync";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

function rewriteAssetPaths(html: string, slug: string, assetNames: string[]): string {
  for (const name of assetNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      `(src|poster)(=["'])(?:[^"']*\\/)?${escaped}(["'])`,
      "gi"
    );
    html = html.replace(re, `$1$2/api/blog-assets/${slug}/${name}$3`);
  }
  return html;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!ALLOWED_EMAILS.includes(session?.user?.email ?? "")) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const formData = await req.formData();
  const slug = formData.get("slug") as string;
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const summary = formData.get("summary") as string;
  const tags = formData.get("tags") as string;
  let transformedHtml = formData.get("transformedHtml") as string;
  const externalScripts = formData.get("externalScripts") as string;
  const thumbnail = formData.get("thumbnail") as File | null;
  const knowledgeBase = formData.get("knowledgeBase") as File | null;
  const knowledgeBaseText = formData.get("knowledgeBaseText") as string | null;
  const assets = formData.getAll("assets") as File[];

  if (!slug || !title || !transformedHtml) {
    return Response.json({ error: "Eksik alanlar" }, { status: 400 });
  }

  try {
    const postDir = path.join(BLOG_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });

    // Save and optimize asset files
    const savedAssetNames: string[] = [];
    for (const asset of assets) {
      if (!asset.name || asset.size === 0) continue;
      const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const ext = path.extname(safeName).toLowerCase();
      const rawBuffer = Buffer.from(await asset.arrayBuffer());

      if (IMAGE_EXTENSIONS.includes(ext) && ext !== ".svg" && ext !== ".gif") {
        const optimized = await sharp(rawBuffer)
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .toBuffer();
        const jpgName = safeName.replace(/\.[^.]+$/, ".jpg");
        fs.writeFileSync(path.join(postDir, jpgName), optimized);
        savedAssetNames.push(jpgName);
      } else {
        fs.writeFileSync(path.join(postDir, safeName), rawBuffer);
        savedAssetNames.push(safeName);
      }
    }

    // Rewrite relative asset paths in HTML to absolute /api/blog-assets/slug/... paths
    if (savedAssetNames.length > 0) {
      transformedHtml = rewriteAssetPaths(transformedHtml, slug, savedAssetNames);
    }

    // Build frontmatter
    const tagList = tags
      ? tags
          .split(",")
          .map((t) => `"${t.trim()}"`)
          .join(", ")
      : "";

    let scriptList: string[] = [];
    if (externalScripts) {
      try {
        scriptList = JSON.parse(externalScripts);
      } catch {
        scriptList = [];
      }
    }
    const scriptLine =
      scriptList.length > 0
        ? `externalScripts: ${JSON.stringify(scriptList)}\n`
        : "";

    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date || new Date().toISOString().slice(0, 10)}"
summary: "${(summary || "").replace(/"/g, '\\"')}"
tags: [${tagList}]
${scriptLine}---
`;

    // Save HTML
    const htmlPath = path.join(postDir, `${slug}.html`);
    fs.writeFileSync(htmlPath, frontmatter + transformedHtml, "utf-8");

    // Save thumbnail (optimized)
    if (thumbnail && thumbnail.size > 0) {
      const thumbPath = path.join(postDir, "anaresim.jpg");
      const rawBuffer = Buffer.from(await thumbnail.arrayBuffer());
      const optimized = await sharp(rawBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      fs.writeFileSync(thumbPath, optimized);
    }

    // Save knowledge base
    if (knowledgeBase && knowledgeBase.size > 0) {
      const kbName = knowledgeBase.name;
      if (kbName.endsWith(".pdf")) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const buffer = Buffer.from(await knowledgeBase.arrayBuffer());
          const data = await pdfParse(buffer);
          fs.writeFileSync(
            path.join(postDir, "makale.md"),
            data.text,
            "utf-8"
          );
        } catch {
          return Response.json(
            { error: "PDF okunamadı" },
            { status: 500 }
          );
        }
      } else {
        const buffer = Buffer.from(await knowledgeBase.arrayBuffer());
        fs.writeFileSync(path.join(postDir, "makale.md"), buffer);
      }
    } else if (knowledgeBaseText) {
      fs.writeFileSync(
        path.join(postDir, "makale.md"),
        knowledgeBaseText,
        "utf-8"
      );
    }

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
    } catch {
      // revalidation may fail in dev, ignore
    }

    gitAutoSync(
      [`content/blog/${slug}`],
      `blog: yeni makale — ${title}`
    ).catch(() => {});

    return Response.json({ success: true, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yayınlama hatası";
    return Response.json({ error: msg }, { status: 500 });
  }
}
