import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";
import pool from "@/lib/db";
import { decrypt } from "@/lib/crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const MURAT_USER_ID = 1;

async function getLibraryContext(): Promise<string> {
  try {
    const result = await pool.query(`
      SELECT lc.content, ld.original_name
      FROM library_chunks lc
      JOIN library_documents ld ON lc.document_id = ld.id
      WHERE lc.user_id = $1
      ORDER BY ld.id, lc.chunk_index
    `, [MURAT_USER_ID]);

    if (result.rows.length === 0) return "";

    const docs = result.rows.map(
      (r: { original_name: string; content: string }) =>
        `[${r.original_name}]\n${r.content}`
    );
    return docs.join("\n\n");
  } catch {
    return "";
  }
}

async function getChatBoxHistory(): Promise<string> {
  try {
    const result = await pool.query(`
      SELECT m.role, m.content, m.created_at
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_id = $1
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [MURAT_USER_ID]);

    if (result.rows.length === 0) return "";

    const msgs = result.rows.reverse().map(
      (r: { role: string; content: string }) => {
        const content = decrypt(r.content, MURAT_USER_ID);
        return `${r.role}: ${content}`;
      }
    );
    return msgs.join("\n");
  } catch {
    return "";
  }
}

async function getOwnHistory(): Promise<string> {
  try {
    const result = await pool.query(`
      SELECT role, content FROM assistant_messages
      ORDER BY created_at DESC LIMIT 100
    `);

    if (result.rows.length === 0) return "";

    const msgs = result.rows.reverse().map(
      (r: { role: string; content: string }) => `${r.role}: ${r.content}`
    );
    return msgs.join("\n");
  } catch {
    return "";
  }
}

async function saveMessages(userMsg: string, assistantMsg: string) {
  try {
    await pool.query(
      `INSERT INTO assistant_messages (role, content) VALUES ('user', $1), ('assistant', $2)`,
      [userMsg, assistantMsg]
    );
  } catch {
    // silent fail
  }
}

async function buildSystemInstruction(): Promise<string> {
  const [libraryContext, chatBoxHistory, ownHistory] = await Promise.all([
    getLibraryContext(),
    getChatBoxHistory(),
    getOwnHistory(),
  ]);

  let instruction = `Sen Murat Saydan'ın kişisel AI asistanısın. Türkçe yanıt ver. Kısa, net ve yardımcı ol. Gerektiğinde detaya gir ama gereksiz uzatma.`;

  if (libraryContext) {
    instruction += `\n\n## Murat Hakkında Bilgiler (CV ve Biyografi)\n${libraryContext}`;
  }

  if (chatBoxHistory) {
    instruction += `\n\n## SaydanChatBox'taki Geçmiş Konuşmalar\nBunlar Murat'ın SaydanChatBox asistanıyla yaptığı konuşmalar:\n${chatBoxHistory}`;
  }

  if (ownHistory) {
    instruction += `\n\n## Önceki Konuşmalarımız\nBunlar seninle daha önce yaptığımız konuşmalar:\n${ownHistory}`;
  }

  return instruction;
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email ?? "";

  if (!ALLOWED_EMAILS.includes(email)) {
    return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { messages } = await req.json();

  const systemInstruction = await buildSystemInstruction();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
  });

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;

  const result = await chat.sendMessageStream(lastMessage);

  let fullResponse = "";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        saveMessages(lastMessage, fullResponse);
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
