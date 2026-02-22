import { auth, ALLOWED_EMAILS } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { gitAutoSync } from "@/lib/gitSync";
import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export async function DELETE(req: Request) {
  const session = await auth();
  if (!ALLOWED_EMAILS.includes(session?.user?.email ?? "")) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { slug } = await req.json();

  if (!slug || typeof slug !== "string") {
    return Response.json({ error: "Slug gerekli" }, { status: 400 });
  }

  const sanitized = slug.replace(/[^a-z0-9-]/gi, "");
  if (!sanitized || sanitized !== slug) {
    return Response.json({ error: "Geçersiz slug" }, { status: 400 });
  }

  const postDir = path.join(BLOG_DIR, sanitized);

  if (!fs.existsSync(postDir)) {
    const singleFile = path.join(BLOG_DIR, `${sanitized}.html`);
    if (fs.existsSync(singleFile)) {
      fs.unlinkSync(singleFile);
    } else {
      return Response.json({ error: "Makale bulunamadı" }, { status: 404 });
    }
  } else {
    fs.rmSync(postDir, { recursive: true, force: true });
  }

  try {
    revalidatePath("/blog");
    revalidatePath(`/blog/${sanitized}`);
  } catch {
    // revalidation may fail in dev
  }

  gitAutoSync(
    [`content/blog/${sanitized}`, `content/blog/${sanitized}.html`],
    `blog: makale silindi — ${sanitized}`
  ).catch(() => {});

  return Response.json({ success: true });
}
