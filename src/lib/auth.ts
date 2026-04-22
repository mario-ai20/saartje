import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Saartje Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";

        if (!username || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        if (!verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.username ?? username,
          email: user.email,
          image: user.image,
          username: user.username ?? username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = typeof user.username === "string" ? user.username : null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const tokenId = typeof token.id === "string" ? token.id : token.sub;
        if (tokenId) {
          session.user.id = tokenId;
        }

        if (typeof token.username === "string") {
          session.user.username = token.username;
        }
      }
      return session;
    },
  },
};
