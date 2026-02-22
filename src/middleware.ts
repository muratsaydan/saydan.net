import { auth } from "@/lib/auth";
import { ALLOWED_EMAILS } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/private")) return;

  const email = req.auth?.user?.email;

  if (!email || !ALLOWED_EMAILS.includes(email)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/private/:path*"],
};
