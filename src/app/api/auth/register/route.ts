import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement super admin authentication
    // If not authenticated as super admin, return unauthorized response

    const { email, username, name, password, role } = await req.json();

    if (!email || !username || !name || !password || !role) {
      return NextResponse.json(
        { message: "Email, username, name, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate the provided role
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { message: "Invalid user role" },
        { status: 400 }
      );
    }

    // Check if user already exists by email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
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

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        // Select fields to return, exclude password
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
