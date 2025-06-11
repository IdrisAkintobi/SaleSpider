import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Ensure PrismaClient is instantiated

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const searchQuery = url.searchParams.get('search') || '';

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }

  const skip = (page - 1) * pageSize;

  try {
    const products = await prisma.product.findMany({
      skip: skip,
      take: pageSize,
      where: {
        name: {
          contains: searchQuery,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    const totalProducts = await prisma.product.count({
      where: {
        name: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json({
      products,
      totalProducts,
      page,
      pageSize,
      totalPages: Math.ceil(totalProducts / pageSize),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Read the custom user ID header set by the middleware
  const userId = req.headers.get('X-User-Id');

  if (!userId) {
    // If header is missing, middleware should have handled this, but as a safeguard
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }


  try {
    const { name, description, price, stock } = await req.json();

    if (!name || !price || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}