import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  accountType: z.enum(["Founder","Partner","Employee","Mentor","Investor","Admin"]),
});

export default {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        accountType: { label: "Account Type", type: "text" },
      },
      async authorize(credentials) {
        const parsed = schema.safeParse({
          email: credentials?.email,
          accountType: credentials?.accountType,
        });
        if (!parsed.success) return null;
        const { email, accountType } = parsed.data;
        return { id: email, email, name: email.split("@")[0], accountType } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.accountType) token.accountType = (user as any).accountType;
      return token;
    },
    async session({ session, token }) {
      (session.user as any).accountType = token.accountType;
      return session;
    },
  },
  pages: { signIn: "/login" },
  debug: true,
} satisfies import("next-auth").NextAuthConfig;
