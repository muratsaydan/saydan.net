import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_INSTRUCTION = `Sen Murat Saydan'ın kişisel AI asistanısın. Türkçe yanıt ver. Kısa, net ve yardımcı ol. Gerektiğinde detaya gir ama gereksiz uzatma.`;

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email ?? "";

  if (!ALLOWED_EMAILS.includes(email)) {
    return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { messages } = await req.json();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;

  const result = await chat.sendMessageStream(lastMessage);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
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
