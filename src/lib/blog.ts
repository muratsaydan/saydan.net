import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
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

function markdownToHtml(md: string): string {
  let html = md;

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary underline hover:text-primary-dark">$1</a>'
  );

  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^\d+\.\s+(.+)$/);
    const ulMatch = line.match(/^[-*]\s+(.+)$/);

    if (listMatch) {
      if (!inList) { result.push("<ol>"); inList = true; }
      result.push(`<li>${listMatch[1]}</li>`);
    } else if (ulMatch) {
      if (!inList) { result.push("<ul>"); inList = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
    } else {
      if (inList) {
        result.push(result[result.length - 2]?.includes("<ol>") ? "</ol>" : "</ul>");
        inList = false;
      }
      if (line.trim() === "") {
        result.push("");
      } else if (!line.startsWith("<h")) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  }
  if (inList) result.push("</ul>");

  return result.join("\n");
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { metadata, content } = parseFrontmatter(raw);

    return {
      slug: file.replace(/\.md$/, ""),
      title: (metadata.title as string) || file,
      date: (metadata.date as string) || "",
      summary: (metadata.summary as string) || "",
      tags: (metadata.tags as string[]) || [],
      content: markdownToHtml(content),
    };
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { metadata, content } = parseFrontmatter(raw);

  return {
    slug,
    title: (metadata.title as string) || slug,
    date: (metadata.date as string) || "",
    summary: (metadata.summary as string) || "",
    tags: (metadata.tags as string[]) || [],
    content: markdownToHtml(content),
  };
}
