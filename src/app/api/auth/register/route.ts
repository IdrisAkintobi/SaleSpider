import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement super admin authentication
    // If not authenticated as super admin, return unauthorized response

    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ message: 'Email, password, and role are required' }, { status: 400 });
    }

    // Validate the provided role
    if (!Object.values(Role).includes(role)) {
        return NextResponse.json({ message: 'Invalid user role' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: { // Select fields to return, exclude password
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}