import { handleException, jsonError, jsonOk } from "@/lib/api-response";
import { AuditTrailService } from "@/lib/audit-trail";
import { createChildLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";
import { NextRequest } from "next/server";
const logger = createChildLogger("api:users:id");

// Function to update user status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || (user.role !== Role.MANAGER && user.role !== Role.SUPER_ADMIN)) {
    return jsonError("Forbidden", 403, { code: "FORBIDDEN" });
  }

  // Prevent self-deactivation
  if (userId === id) {
    return jsonError("Cannot update your own status", 400, {
      code: "BAD_REQUEST",
    });
  }

  // Validate status
  if (!Object.values(UserStatus).includes(status)) {
    return jsonError("Invalid status value", 400, { code: "BAD_REQUEST" });
  }

  try {
    // Get the current user data before update for audit trail
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { status: true, name: true, email: true },
    });

    if (!currentUser) {
      return jsonError("User not found", 404, { code: "NOT_FOUND" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log audit trail for status change
    await AuditTrailService.logUserUpdate(id, { status }, userId, user.email, {
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
      previousStatus: currentUser.status,
      targetUserName: currentUser.name,
      targetUserEmail: currentUser.email,
      action: "STATUS_UPDATE",
    });

    logger.info(
      {
        actorUserId: userId,
        actorUserEmail: user.email,
        targetUserId: id,
        targetUserName: currentUser.name,
        previousStatus: currentUser.status,
        newStatus: status,
      },
      "User status updated"
    );

    return jsonOk(updatedUser);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to update user status"
    );
    return handleException(error, "Failed to update user status", 500);
  }
}
