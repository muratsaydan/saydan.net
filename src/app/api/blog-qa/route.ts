import { GoogleGenerativeAI } from "@google/generative-ai";
import { getKnowledgeBase } from "@/lib/blog";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

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

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
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

  const systemInstruction = `Sen bir makale uzmanısın. Aşağıdaki makaleye dayanarak soruları Türkçe yanıtla. 
Kısa, net ve bilgilendirici ol. Sadece makaledeki bilgilere dayan. 
Makalede olmayan bir konu sorulursa "Bu konu makalede ele alınmamıştır." de.

## Makale İçeriği:
${knowledgeBase}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
  });

  const result = await model.generateContentStream(question);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
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
