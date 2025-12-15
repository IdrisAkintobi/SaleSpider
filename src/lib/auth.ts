import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

/**
 * Authenticates a user from the request headers and returns user info
 * Returns null if authentication fails
 */
export async function authenticateUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  // Read the X-User-Id header set by the middleware
  const userId = request.headers.get("X-User-Id");
  if (!userId) {
    return null;
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
  };
}

/**
 * Authenticates a user and checks if they have the required role(s)
 * Returns the user if authorized, or a NextResponse with error if not
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[]
): Promise<AuthenticatedUser | NextResponse> {
  const user = await authenticateUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return user;
}

/**
 * Helper to check if a value is a NextResponse (error response)
 */
export function isErrorResponse(value: any): value is NextResponse {
  return value instanceof NextResponse;
}

/**
 * Checks if a user has SUPER_ADMIN role
 */
export function isSuperAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}
