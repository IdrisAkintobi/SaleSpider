import type { NextRequest } from "next/server";
import type { PrismaClient, User } from "@prisma/client";

/**
 * Extracts userId from X-User-Id header and fetches the User.
 * Returns { userId, user } where either can be null if missing.
 */
export async function getUserFromHeader(
  request: Request,
  prisma: PrismaClient
): Promise<{ userId: string | null; user: User | null }> {
  const userId = (request as NextRequest).headers.get("X-User-Id");
  if (!userId) return { userId: null, user: null };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return { userId, user };
}
