import { PaymentMode, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { calculateSaleTotals } from "@/lib/vat";
import { startOfDay, endOfDay } from "date-fns";
import { createChildLogger } from "@/lib/logger";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";

import { prisma } from "@/lib/prisma";
const logger = createChildLogger('sales-api');

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
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  // Parse query params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const cashierId = searchParams.get("cashierId");
  const paymentMethod = searchParams.get("paymentMethod");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = (searchParams.get("search") || "").trim();

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
    const where: any = { deletedAt: null };
    if (user.role === Role.CASHIER) {
      where.cashierId = userId;
    }
    // Manager filter by cashier
    if (cashierId && cashierId !== "all") {
      where.cashierId = cashierId;
    }
    // Payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMode = paymentMethod as PaymentMode;
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

    // Apply search filter (by sale ID, cashier name/username, product name, or payment mode label)
    if (search) {
      const searchLower = search.toLowerCase();
      // Map payment mode label search to enum values if matched
      const paymentModeMatches: PaymentMode[] = [];
      const labelToEnum: Array<{ label: string; value: PaymentMode }> = [
        { label: "cash", value: PaymentMode.CASH },
        { label: "card", value: PaymentMode.CARD },
        { label: "bank transfer", value: PaymentMode.BANK_TRANSFER },
        { label: "crypto", value: PaymentMode.CRYPTO },
        { label: "other", value: PaymentMode.OTHER },
      ];
      for (const entry of labelToEnum) {
        if (entry.label.includes(searchLower)) paymentModeMatches.push(entry.value);
      }

      where.OR = [
        // Case-insensitive sale ID match
        { id: { contains: search, mode: 'insensitive' } },
        // Cashier name/username contains
        { cashier: { name: { contains: search, mode: 'insensitive' } } },
        { cashier: { username: { contains: search, mode: 'insensitive' } } },
        // Product name on any sale item contains
        { items: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
      ];

      if (paymentModeMatches.length > 0) {
        where.OR.push({ paymentMode: { in: paymentModeMatches } });
      }
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
      subtotal: sale.subtotal,
      vatAmount: sale.vatAmount,
      vatPercentage: sale.vatPercentage,
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

    return jsonOk({ data: transformedSales, total, paymentMethodTotals, totalSalesValue });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to fetch sales');
    return handleException(error, "Failed to fetch sales", 500);
  }
}

// Function to record a sale
export async function POST(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  // Only cashiers can record sales
  if (user.role !== Role.CASHIER) {
    return jsonError("Only cashiers can record sales", 403, { code: "FORBIDDEN" });
  }

  try {
    const { cashierId, items, totalAmount, paymentMode } = await req.json();

    // Validate input
    if (!cashierId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !paymentMode) {
      return jsonError("Invalid sale data", 400, { code: "BAD_REQUEST" });
    }

    // Verify cashier ID matches the authenticated user
    if (cashierId !== userId) {
      return jsonError("Cashier ID mismatch", 403, { code: "FORBIDDEN" });
    }

    // Validate items and check stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return jsonError(`Product ${item.productId} not found`, 404, { code: "NOT_FOUND" });
      }

      if (product.quantity < item.quantity) {
        return jsonError(
          `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
          400,
          { code: "BAD_REQUEST" }
        );
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

    logger.info({
      saleId: result.id,
      cashierId,
      totalAmount: saleTotals.totalAmount,
      itemCount: items.length,
      paymentMode: mappedPaymentMode
    }, 'Sale recorded successfully');

    return jsonOk({ 
      id: result.id,
      message: "Sale recorded successfully" 
    });

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to record sale');
    return handleException(error, "Failed to record sale", 500);
  }
} 