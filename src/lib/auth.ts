import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const ALLOWED_EMAILS = ["murat@saydan.net", "muratsaydan1@gmail.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async signIn({ profile, user }) {
      const email = profile?.email ?? user?.email ?? "";
      return ALLOWED_EMAILS.includes(email);
    },
    async session({ session }) {
      return session;
    },
  },
});
