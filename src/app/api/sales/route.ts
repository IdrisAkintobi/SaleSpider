import { PrismaClient, Role, PaymentMode } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { calculateSaleTotals } from "@/lib/vat";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

// Helper function to map payment mode string to enum
function mapPaymentMode(paymentModeString: string): PaymentMode {
  const mapping: Record<string, PaymentMode> = {
    "Cash": PaymentMode.CASH,
    "Card": PaymentMode.CARD,
    "Bank Transfer": PaymentMode.BANK_TRANSFER,
    "Crypto": PaymentMode.CRYPTO,
    "Other": PaymentMode.OTHER,
  };
  
  return mapping[paymentModeString] || PaymentMode.CASH;
}

// Function to get sales
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Parse query params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const cashierId = searchParams.get("cashierId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Map sort field to Prisma
  let orderBy: any = {};
  if (sort === "cashierName") {
    orderBy = { cashier: { name: order } };
  } else if (sort === "totalAmount") {
    orderBy = { totalAmount: order };
  } else if (sort === "paymentMode") {
    orderBy = { paymentMode: order };
  } else {
    orderBy = { createdAt: order };
  }

  try {
    // Build where clause
    let where: any = { deletedAt: null };
    if (user.role === Role.CASHIER) {
      where.cashierId = userId;
    }
    // Manager filter by cashier
    if (cashierId && cashierId !== "all") {
      where.cashierId = cashierId;
    }
    // Date range filter with proper time boundaries
    if (from && to) {
      where.createdAt = { 
        gte: startOfDay(new Date(from)), 
        lte: endOfDay(new Date(to)) 
      };
    } else if (from) {
      where.createdAt = { gte: startOfDay(new Date(from)) };
    } else if (to) {
      where.createdAt = { lte: endOfDay(new Date(to)) };
    }

    // Get total count for pagination
    const total = await prisma.sale.count({ where });

    // Get total sales value for all filtered sales
    const totalSalesValueAgg = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where,
    });
    const totalSalesValue = Number(totalSalesValueAgg._sum.totalAmount || 0);

    // Aggregate total sales by payment method
    const paymentMethodTotalsRaw = await prisma.sale.groupBy({
      by: ['paymentMode'],
      _sum: { totalAmount: true },
      where,
    });
    // Convert to object: { Cash: 1000, Card: 500, ... }
    const paymentMethodTotals = paymentMethodTotalsRaw.reduce((acc, row) => {
      acc[row.paymentMode] = Number(row._sum.totalAmount || 0);
      return acc;
    }, {} as Record<PaymentMode, number>);

    // Fetch paginated, sorted sales
    const sales = await prisma.sale.findMany({
      where,
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Transform the data to match frontend expectations
    const transformedSales = sales.map((sale: any) => ({
      id: sale.id,
      cashierId: sale.cashierId,
      cashierName: sale.cashier.name,
      totalAmount: sale.totalAmount,
      paymentMode: sale.paymentMode,
      timestamp: new Date(sale.createdAt).getTime(), // Convert to timestamp
      items: sale.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return NextResponse.json({ data: transformedSales, total, paymentMethodTotals, totalSalesValue });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { message: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// Function to record a sale
export async function POST(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only cashiers can record sales
  if (user.role !== Role.CASHIER) {
    return NextResponse.json({ message: "Only cashiers can record sales" }, { status: 403 });
  }

  try {
    const { cashierId, items, totalAmount, paymentMode } = await req.json();

    // Validate input
    if (!cashierId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !paymentMode) {
      return NextResponse.json({ message: "Invalid sale data" }, { status: 400 });
    }

    // Verify cashier ID matches the authenticated user
    if (cashierId !== userId) {
      return NextResponse.json({ message: "Cashier ID mismatch" }, { status: 403 });
    }

    // Validate items and check stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 404 });
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
        }, { status: 400 });
      }
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate VAT totals
    const saleTotals = calculateSaleTotals(subtotal);

    // Map payment mode to enum
    const mappedPaymentMode = mapPaymentMode(paymentMode);

    // Create the sale and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
        data: {
          cashierId,
          subtotal: saleTotals.subtotal,
          vatAmount: saleTotals.vatAmount,
          vatPercentage: saleTotals.vatPercentage,
          totalAmount: saleTotals.totalAmount,
          paymentMode: mappedPaymentMode,
        },
      });

      // Create sale items and update product stock
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    return NextResponse.json({ 
      id: result.id,
      message: "Sale recorded successfully" 
    });

  } catch (error) {
    console.error("Error recording sale:", error);
    return NextResponse.json(
      { message: "Failed to record sale" },
      { status: 500 }
    );
  }
} 