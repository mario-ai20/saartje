import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const builderCode = process.env.BUILDER_CODE?.trim() ?? "";
const builderName = process.env.BUILDER_NAME?.trim() || "Feline Builder";
const builderInternalUsername = "__builder__";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Feline Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        builderCode: { label: "Builder code", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        const submittedBuilderCode = credentials?.builderCode?.toString().trim() ?? "";

        if (submittedBuilderCode) {
          if (!builderCode || submittedBuilderCode !== builderCode) {
            return null;
          }

          const builderUser = await prisma.user.upsert({
            where: { username: builderInternalUsername },
            update: { name: builderName },
            create: { username: builderInternalUsername, name: builderName },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
            },
          });

          return {
            id: builderUser.id,
            name: builderUser.name ?? builderName,
            email: builderUser.email,
            image: builderUser.image,
            username: builderUser.username ?? builderInternalUsername,
            role: "builder",
          };
        }

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
          role: "user",
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
        token.role = user.role ?? "user";
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

        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};

export async function getAuthenticatedUser() {
  const session = (await getServerSession(authOptions as never)) as {
    user?: { id?: string; name?: string | null; username?: string | null; role?: string | null };
  } | null;
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  if (!user) {
    return null;
  }

  const role = user.username === builderInternalUsername ? "builder" : "user";

  return {
    id: user.id,
    name: user.name ?? session.user?.name ?? null,
    role,
  };
}
