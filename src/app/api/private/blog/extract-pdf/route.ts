import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!ALLOWED_EMAILS.includes(session?.user?.email ?? "")) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // pdf-parse uses dynamic require internally, import at runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return Response.json({ text: data.text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF okunamadı";
    return Response.json({ error: msg }, { status: 500 });
  }
}
