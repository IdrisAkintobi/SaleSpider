import { Product } from "@/lib/types";
import { Prisma, PrismaClient, ProductCategory, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10", 10);
  const searchQuery = url.searchParams.get("search") ?? "";
  const sortField = url.searchParams.get("sortField") ?? "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Read the custom user ID header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    // fallback safety check.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role === Role.CASHIER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        { error: "Missing required fields" },
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

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
// Get enum values that contain the search term
const matchingCategories = (searchQuery?: string) => {
  return searchQuery
    ? Object.values(ProductCategory).filter((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
};
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
