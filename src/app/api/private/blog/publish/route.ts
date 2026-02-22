import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

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
  const transformedHtml = formData.get("transformedHtml") as string;
  const externalScripts = formData.get("externalScripts") as string;
  const thumbnail = formData.get("thumbnail") as File | null;
  const knowledgeBase = formData.get("knowledgeBase") as File | null;
  const knowledgeBaseText = formData.get("knowledgeBaseText") as string | null;

  if (!slug || !title || !transformedHtml) {
    return Response.json({ error: "Eksik alanlar" }, { status: 400 });
  }

  try {
    const postDir = path.join(BLOG_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });

    // Build frontmatter
    const tagList = tags
      ? tags
          .split(",")
          .map((t) => `"${t.trim()}"`)
          .join(", ")
      : "";

    const scriptList = externalScripts ? JSON.parse(externalScripts) : [];
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

    // Save thumbnail
    if (thumbnail && thumbnail.size > 0) {
      const ext = path.extname(thumbnail.name) || ".jpg";
      const thumbPath = path.join(postDir, `anaresim${ext}`);
      const buffer = Buffer.from(await thumbnail.arrayBuffer());
      fs.writeFileSync(thumbPath, buffer);
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

    // Revalidate blog pages
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);

    return Response.json({ success: true, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yayınlama hatası";
    return Response.json({ error: msg }, { status: 500 });
  }
}
