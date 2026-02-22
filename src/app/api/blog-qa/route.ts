import { GoogleGenerativeAI } from "@google/generative-ai";
import { getKnowledgeBase } from "@/lib/blog";
import { gitAutoSync } from "@/lib/gitSync";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  date: string;
}

function getQAPath(slug: string): string {
  return path.join(BLOG_DIR, slug, "qa.json");
}

function loadQA(slug: string): QAEntry[] {
  const qaPath = getQAPath(slug);
  if (!fs.existsSync(qaPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(qaPath, "utf-8"));
  } catch {
    return [];
  }
}

function saveQA(slug: string, entries: QAEntry[]): void {
  const qaPath = getQAPath(slug);
  const dir = path.dirname(qaPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(qaPath, JSON.stringify(entries, null, 2), "utf-8");
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "Eksik parametre" }, { status: 400 });
  }

  const sanitized = slug.replace(/[^a-z0-9-]/gi, "");
  const entries = loadQA(sanitized);
  return Response.json(entries);
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Çok fazla istek gönderildi. Lütfen bir dakika bekleyin." },
      { status: 429 }
    );
  }

  const { slug, question } = await req.json();
  if (!slug || !question) {
    return Response.json({ error: "Eksik parametre" }, { status: 400 });
  }

  const knowledgeBase = getKnowledgeBase(slug);
  if (!knowledgeBase) {
    return Response.json(
      { error: "Bu makale için soru-cevap özelliği aktif değil." },
      { status: 404 }
    );
  }

  const existingQA = loadQA(slug);
  const historyContext =
    existingQA.length > 0
      ? `\n\n## Önceki Soru-Cevaplar:\n${existingQA
          .slice(-10)
          .map((e) => `S: ${e.question}\nC: ${e.answer}`)
          .join("\n\n")}`
      : "";

  const systemInstruction = `Sen bir makale uzmanısın. Aşağıdaki makaleye dayanarak soruları Türkçe yanıtla. 
Kısa, net ve bilgilendirici ol. Sadece makaledeki bilgilere dayan. 
Makalede olmayan bir konu sorulursa "Bu konu makalede ele alınmamıştır." de.

## Makale İçeriği:
${knowledgeBase}${historyContext}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
  });

  const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let fullAnswer = "";

  const result = await model.generateContentStream(question);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullAnswer += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        const newEntry: QAEntry = {
          id: entryId,
          question: question.trim(),
          answer: fullAnswer.trim(),
          date: new Date().toISOString(),
        };
        const entries = loadQA(slug);
        entries.push(newEntry);
        saveQA(slug, entries);

        gitAutoSync(
          [`content/blog/${slug}/qa.json`],
          `blog: yeni soru-cevap — ${slug}`
        ).catch(() => {});

        controller.enqueue(
          encoder.encode(`\n<!--QA_ID:${entryId}-->`)
        );
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Bilinmeyen hata";
        controller.enqueue(encoder.encode(`\n[Hata: ${errMsg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
