import { Role, UserStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";
import { createChildLogger } from "@/lib/logger";

import { prisma } from "@/lib/prisma";
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

    return jsonOk(updatedUser);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to update user status"
    );
    return handleException(error, "Failed to update user status", 500);
  }
}
