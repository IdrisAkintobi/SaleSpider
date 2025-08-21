import { PrismaClient, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createChildLogger } from "@/lib/logger";
import { AuditTrailService } from "@/lib/audit-trail";
import * as argon2 from "argon2";

const prisma = new PrismaClient();
const logger = createChildLogger('api:users');

// Function to get users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const sort = searchParams.get("sort") || "createdAt";
    const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Handle role filtering with super admin exclusion
    if (role) {
      where.role = role as Role;
    } else {
      // Exclude super admin users from the list when no specific role is requested
      where.role = {
        not: "SUPER_ADMIN",
      };
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Map sort field
    const orderBy: any = {};
    if (["name", "username", "status", "role", "createdAt"].includes(sort)) {
      orderBy[sort] = order;
    } else {
      orderBy["createdAt"] = order;
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({ data: users, total });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error fetching users');
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Function to create a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, email, password, role } = body;

    // Validate required fields
    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: role as Role,
        status: "ACTIVE",
      },
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error creating user');
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// Function to update a user
export async function PATCH(request: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = request.headers.get("X-User-Id");
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const actingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!actingUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, username, email, role, status } = body;
    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }
    // Only super-admin can edit all, manager can only edit cashiers
    const targetUser = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, role: true }
    });
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (actingUser.role === "MANAGER" && targetUser.role !== "CASHIER") {
      return NextResponse.json({ message: "Managers can only edit cashiers" }, { status: 403 });
    }
    if (actingUser.role !== "SUPER_ADMIN" && actingUser.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Prepare update data and track changed fields for audit trail
    const updateData: any = {
      ...(name && { name }),
      ...(username && { username }),
      ...(email && { email }),
      ...(role && { role }),
      ...(status && { status }),
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    // Log audit trail with only changed fields (no DB fetch)
    if (Object.keys(updateData).length > 0) {
      await AuditTrailService.logUserUpdate(
        id,
        updateData,
        userId,
        actingUser.email,
        {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
        }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error({ userId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating user');
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
} 