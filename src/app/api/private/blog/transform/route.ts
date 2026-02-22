import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";
import { transformHtml, generateSlug } from "@/lib/blogTransformer";

export async function POST(req: Request) {
  const session = await auth();
  if (!ALLOWED_EMAILS.includes(session?.user?.email ?? "")) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { rawHtml } = await req.json();
  if (!rawHtml || typeof rawHtml !== "string") {
    return Response.json({ error: "HTML içeriği gerekli" }, { status: 400 });
  }

  const result = transformHtml(rawHtml);
  const suggestedSlug = generateSlug(result.detectedTitle);

  return Response.json({
    transformedHtml: result.html,
    externalScripts: result.externalScripts,
    detectedTitle: result.detectedTitle,
    detectedSummary: result.detectedSummary,
    suggestedSlug,
  });
}
