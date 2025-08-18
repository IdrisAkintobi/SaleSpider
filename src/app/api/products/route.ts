import { Product } from "@/lib/types";
import { Prisma, PrismaClient, ProductCategory, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createChildLogger } from "@/lib/logger";

const prisma = new PrismaClient();
const logger = createChildLogger('products-api');

// Function to get products
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10", 10);
  const searchQuery = url.searchParams.get("search") ?? "";
  const sortField = url.searchParams.get("sortField") ?? "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    return NextResponse.json(
      { message: "Invalid pagination parameters" },
      { status: 400 }
    );
  }

  const skip = (page - 1) * pageSize;

  try {
    const orderBy = {
      [sortField]: sortOrder === "asc" ? "asc" : "desc",
    };

    const products = await prisma.product.findMany({
      skip,
      take: pageSize,
      where: productSearchWhere(searchQuery) as Prisma.ProductWhereInput,
      orderBy: orderBy,
    });

    const totalProducts = await prisma.product.count({
      where: {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
        deletedAt: null,
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
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      searchQuery,
      page,
      pageSize
    }, 'Error fetching products');
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Function to create a product
export async function POST(req: NextRequest) {
  // Read the custom user ID header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    // fallback safety check.
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role === Role.CASHIER) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, description, price, category, lowStockMargin, quantity } =
      (await req.json()) as Product;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !lowStockMargin ||
      !quantity
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        lowStockMargin,
        quantity,
      },
    });

    logger.info({
      productId: newProduct.id,
      name: newProduct.name,
      userId
    }, 'Product created successfully');
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      userId
    }, 'Error creating product');
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}

// Function to get enum values that contain the search term
const matchingCategories = (searchQuery?: string) => {
  return searchQuery
    ? Object.values(ProductCategory).filter((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
};

// Function to search for products
function productSearchWhere(searchQuery?: string) {
  const matchCategories = matchingCategories(searchQuery);
  return searchQuery
    ? {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          ...(matchCategories.length > 0
            ? [
                {
                  category: {
                    in: matchCategories,
                  },
                },
              ]
            : []),
        ],
        deletedAt: null,
      }
    : { deletedAt: null };
}
