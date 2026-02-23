import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.join(BLOG_DIR, ...segments);

  // Security: prevent directory traversal
  if (!filePath.startsWith(BLOG_DIR)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return new Response("Not Found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  return new Response(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "ETag": `"${stat.mtimeMs.toString(36)}-${stat.size.toString(36)}"`,
    },
  });
}
