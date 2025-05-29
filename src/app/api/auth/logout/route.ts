import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the 'auth_token' cookie by setting its expiration to a past date
    (await cookies()).set('auth_token', '', { expires: new Date(0), httpOnly: true, path: '/' });

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}