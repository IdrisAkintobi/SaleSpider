import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { SignJWT } from 'jose';

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

    // Generate JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = 'HS256';

    const token = await new SignJWT({ userId: user.id, email: user.email })
 .setProtectedHeader({ alg })
      .setExpirationTime('24h') // Token expires in 24 hours
      .sign(secret);

    const response = NextResponse.json({ message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } });
    // Set JWT as an HTTP-only cookie
    response.cookies.set('auth_token', token, { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production' });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
