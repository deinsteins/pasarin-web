import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
          const response = await fetch(`${backendUrl}/api/auth/oauth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
          });

          if (!response.ok) {
            console.error("Backend OAuth registration failed:", await response.text());
            return false;
          }

          const data = await response.json();
          const token = data.token;

          if (token) {
            const cookieStore = await cookies();
            cookieStore.set("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: "/",
            });
            return true;
          }
        } catch (error) {
          console.error("NextAuth Google sign-in BFF error:", error);
        }
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "next-auth-secret-placeholder",
});

export { handler as GET, handler as POST };
