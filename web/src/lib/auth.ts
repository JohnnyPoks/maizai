import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encode, decode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import type { NextRequest } from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || user.disabled) return null;

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordMatch) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastSignInAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as unknown as { role: string; mustChangePassword: boolean };
        token.role = u.role;
        token.mustChangePassword = u.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        const u = session.user as unknown as { role: string; mustChangePassword: boolean };
        u.role = token.role as string;
        u.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
});

// ── Mobile JWT helpers ────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
};

// Distinct salt so mobile tokens are never confused with web session cookies.
const MOBILE_SALT = "authjs.mobile-token";
const MOBILE_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export async function encodeMobileToken(payload: {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
}): Promise<string> {
  return encode({
    token: {
      sub: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      mustChangePassword: payload.mustChangePassword,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + MOBILE_TOKEN_TTL,
    },
    secret: process.env.NEXTAUTH_SECRET!,
    salt: MOBILE_SALT,
  });
}

/**
 * Resolves the caller identity from either:
 *   - Authorization: Bearer <mobile-jwt>  (React Native app)
 *   - NextAuth session cookie             (web browser)
 *
 * Returns null when the request is unauthenticated or the token is invalid.
 * When a Bearer header is present but invalid, never falls through to cookies.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = await decode({
        token: authHeader.slice(7),
        secret: process.env.NEXTAUTH_SECRET!,
        salt: MOBILE_SALT,
      });
      if (payload?.sub && payload.role) {
        return {
          id: payload.sub,
          email: (payload.email as string | undefined) ?? "",
          role: payload.role as string,
          mustChangePassword: (payload.mustChangePassword as boolean | undefined) ?? false,
        };
      }
    } catch {
      // Token present but invalid/expired — reject immediately.
    }
    return null;
  }

  // Fall back to NextAuth session cookie (web dashboard).
  const session = await auth();
  if (!session?.user?.id) return null;
  const u = session.user as unknown as { role?: string; mustChangePassword?: boolean };
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: u.role ?? "",
    mustChangePassword: u.mustChangePassword ?? false,
  };
}
