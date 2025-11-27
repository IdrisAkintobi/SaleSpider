import { jsonError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

/**
 * Middleware to require manager or admin role for API routes
 * Returns user data if authorized, or an error response if not
 */
export async function requireManagerOrAdmin(request: NextRequest | Request) {
  const userId = request.headers.get("X-User-Id");

  if (!userId) {
    return {
      error: jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" }),
      userId: null,
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  if (!user || user.role === Role.CASHIER) {
    return {
      error: jsonError("Forbidden", 403, { code: "FORBIDDEN" }),
      userId,
      user: null,
    };
  }

  return { error: null, userId, user };
}

/**
 * Middleware to require super admin role for API routes
 */
export async function requireSuperAdmin(request: NextRequest | Request) {
  const userId = request.headers.get("X-User-Id");

  if (!userId) {
    return {
      error: jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" }),
      userId: null,
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  if (!user || user.role !== Role.SUPER_ADMIN) {
    return {
      error: jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" }),
      userId,
      user: null,
    };
  }

  return { error: null, userId, user };
}

/**
 * Middleware to require any authenticated user
 */
export async function requireAuth(request: NextRequest | Request) {
  const userId = request.headers.get("X-User-Id");

  if (!userId) {
    return {
      error: jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" }),
      userId: null,
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  if (!user) {
    return {
      error: jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" }),
      userId,
      user: null,
    };
  }

  return { error: null, userId, user };
}
