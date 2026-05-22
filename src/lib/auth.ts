import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn("[Auth] Missing email or password in credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.warn(`[Auth] User not found: ${credentials.email}`);
            return null;
          }

          if (!user.password) {
            console.warn(`[Auth] User has no password set: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.warn(`[Auth] Invalid password for user: ${credentials.email}`);
            return null;
          }

          console.log(`[Auth] Login successful: ${credentials.email}`);
          return {
            id: user.id,
            email: user.email,
            name: user.shopName,
          };
        } catch (error) {
          console.error("[Auth] Authorize callback error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;

        try {
          const userId = token.id as string;
          const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
          });

          if (!userExists) {
            const email = token.email || session.user?.email || `user_${userId}@zenla.com`;
            const name = token.name || session.user?.name || "My Shop";
            console.log(`[Auth] User ${userId} not found in database. Auto-creating profile...`);
            await prisma.user.create({
              data: {
                id: userId,
                email: email,
                shopName: name,
              },
            });
          }
        } catch (error) {
          console.error("[Auth] Failed to auto-create user in session callback:", error);
        }
      }
      return session;
    },
  },
});
