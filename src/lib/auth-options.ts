import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone?.trim();
        const password = credentials?.password;
        if (!phone || !password) return null;

        const user = await prisma.user.findUnique({
          where: { phone },
          include: { farmer: true, buyer: true },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.nameEn,
          email: user.email ?? undefined,
          role: user.role,
          farmerId: user.farmer?.id ?? null,
          buyerId: user.buyer?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as Role;
        token.farmerId = (user as { farmerId?: string | null }).farmerId ?? null;
        token.buyerId = (user as { buyerId?: string | null }).buyerId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as Role;
        session.user.farmerId = (token.farmerId as string | null | undefined) ?? null;
        session.user.buyerId = (token.buyerId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
};
