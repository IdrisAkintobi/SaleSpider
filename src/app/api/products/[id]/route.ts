import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { NextRequest } from \'next/server\';
const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { quantity } = await request.json();

  // Read the X-User-Id header set by the middleware
  const userId = (request as NextRequest).headers.get(\'X-User-Id\');

  if (!userId) {
    // This should ideally not happen if middleware is configured correctly,
    // but it's a fallback for safety.
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || user.role !== 'MANAGER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (typeof quantity !== 'number' || quantity < 0) {
    return NextResponse.json({ message: 'Invalid quantity provided' }, { status: 400 });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) }, // Assuming product ID is an integer
      data: { quantity },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product stock:', error);
    return NextResponse.json({ message: 'Failed to update product stock' }, { status: 500 });
  }
}