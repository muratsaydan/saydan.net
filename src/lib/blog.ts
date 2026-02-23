import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  thumbnail: string;
  content: string;
  externalScripts: string[];
  knowledgeBase: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): {
  metadata: Record<string, string | string[]>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { metadata: {}, content: raw };

  const metadata: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      metadata[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^"|"$/g, ""));
    } else {
      metadata[key] = value;
    }
  }

  return { metadata, content: match[2].trim() };
}

function parseExternalScripts(
  metadata: Record<string, string | string[]>
): string[] {
  const raw = metadata.externalScripts;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw as string);
  } catch {
    return [];
  }
}

function parseSimpleFile(file: string): BlogPost | null {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  const { metadata, content } = parseFrontmatter(raw);
  const slug = file.replace(/\.(html|md)$/, "");

  return {
    slug,
    title: (metadata.title as string) || slug,
    date: (metadata.date as string) || "",
    summary: (metadata.summary as string) || "",
    tags: (metadata.tags as string[]) || [],
    thumbnail: (metadata.thumbnail as string) || "",
    content,
    externalScripts: parseExternalScripts(metadata),
    knowledgeBase: "",
  };
}

function parseFolderPost(slug: string): BlogPost | null {
  const folderPath = path.join(BLOG_DIR, slug);

  let htmlFile = "";
  for (const candidate of [`${slug}.html`, "index.html"]) {
    if (fs.existsSync(path.join(folderPath, candidate))) {
      htmlFile = candidate;
      break;
    }
  }
  if (!htmlFile) return null;

  const raw = fs.readFileSync(path.join(folderPath, htmlFile), "utf-8");
  const { metadata, content } = parseFrontmatter(raw);

  let knowledgeBase = "";
  for (const kbFile of ["makale.md", "makale.txt"]) {
    const kbPath = path.join(folderPath, kbFile);
    if (fs.existsSync(kbPath)) {
      knowledgeBase = fs.readFileSync(kbPath, "utf-8");
      break;
    }
  }

  let thumbnail = (metadata.thumbnail as string) || "";
  if (!thumbnail) {
    for (const imgFile of [
      "anaresim.jpg",
      "anaresim.png",
      "anaresim.webp",
      "thumbnail.jpg",
      "thumbnail.png",
    ]) {
      const imgPath = path.join(folderPath, imgFile);
      if (fs.existsSync(imgPath)) {
        const mtime = fs.statSync(imgPath).mtimeMs;
        thumbnail = `/api/blog-assets/${slug}/${imgFile}?v=${Math.floor(mtime / 1000)}`;
        break;
      }
    }
  }

  return {
    slug,
    title: (metadata.title as string) || slug,
    date: (metadata.date as string) || "",
    summary: (metadata.summary as string) || "",
    tags: (metadata.tags as string[]) || [],
    thumbnail,
    content,
    externalScripts: parseExternalScripts(metadata),
    knowledgeBase,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const posts: BlogPost[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const post = parseFolderPost(entry.name);
      if (post) posts.push(post);
    } else if (entry.name.endsWith(".html") || entry.name.endsWith(".md")) {
      const post = parseSimpleFile(entry.name);
      if (post) posts.push(post);
    }
  }

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const folderPath = path.join(BLOG_DIR, slug);
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    return parseFolderPost(slug);
  }

  for (const ext of [".html", ".md"]) {
    const filePath = path.join(BLOG_DIR, `${slug}${ext}`);
    if (fs.existsSync(filePath)) {
      return parseSimpleFile(`${slug}${ext}`);
    }
  }

  return null;
}

export function getKnowledgeBase(slug: string): string {
  const folderPath = path.join(BLOG_DIR, slug);
  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    return "";
  }
  for (const kbFile of ["makale.md", "makale.txt"]) {
    const kbPath = path.join(folderPath, kbFile);
    if (fs.existsSync(kbPath)) {
      return fs.readFileSync(kbPath, "utf-8");
    }
  }
  return "";
}
