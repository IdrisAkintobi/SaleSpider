import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Verify JWT token and return user data
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthUser;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Get user from request headers (set by middleware)
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const userId = request.headers.get("X-User-Id");
  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, requiredRole: string): boolean {
  if (!user) return false;

  const roleHierarchy = {
    SUPER_ADMIN: 3,
    MANAGER: 2,
    CASHIER: 1,
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: AuthUser | null): boolean {
  return hasRole(user, "SUPER_ADMIN");
}

/**
 * Check if user is manager or higher
 */
export function isManager(user: AuthUser | null): boolean {
  return hasRole(user, "MANAGER");
}

/**
 * Check if user is cashier or higher
 */
export function isCashier(user: AuthUser | null): boolean {
  return hasRole(user, "CASHIER");
}
