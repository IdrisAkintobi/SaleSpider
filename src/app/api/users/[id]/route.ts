import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createChildLogger } from "@/lib/logger";

const prisma = new PrismaClient();
const logger = createChildLogger('api:users:id');

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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || (user.role !== Role.MANAGER && user.role !== Role.SUPER_ADMIN)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Prevent self-deactivation
  if (userId === id) {
    return NextResponse.json(
      { message: "Cannot update your own status" },
      { status: 400 }
    );
  }

  // Validate status
  if (!Object.values(UserStatus).includes(status)) {
    return NextResponse.json(
      { message: "Invalid status value" },
      { status: 400 }
    );
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error({ userId, targetUserId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating user status');
    return NextResponse.json(
      { message: "Failed to update user status" },
      { status: 500 }
    );
  }
} 