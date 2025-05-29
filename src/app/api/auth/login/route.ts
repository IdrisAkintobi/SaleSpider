import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Use argon2.verify for password comparison
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // TODO: Implement token generation and session management
    return NextResponse.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
