import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

interface ManagerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  activeCashiers: number;
  lowStockItems: number;
  dateRange: {
    from: string;
    to: string;
  };
}

interface CashierAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dateRange: {
    from: string;
    to: string;
  };
}

function getTodayDateRange() {
  const now = new Date();
  return { from: startOfDay(now), to: endOfDay(now) };
}

async function handleCashierAnalytics(
  userId: string
): Promise<CashierAnalytics> {
  const dateRange = getTodayDateRange();

  const salesMetrics = await prisma.sale.aggregate({
    where: {
      cashierId: userId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const totalRevenue = salesMetrics._sum.totalAmount ?? 0;
  const totalOrders = salesMetrics._count.id ?? 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    dateRange: {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    },
  };
}

async function handleManagerAnalytics(
  from: Date,
  to: Date
): Promise<ManagerAnalytics> {
  // Execute all queries in parallel for better performance
  const [salesMetrics, activeCashiers, lowStockItems] = await Promise.all([
    // Get sales metrics (revenue and order count) for the selected period
    prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    }),

    // Get active cashiers count (current state, not time-based)
    prisma.user.count({
      where: {
        role: Role.CASHIER,
        status: "ACTIVE",
      },
    }),

    // Get low stock items count (current state, not time-based)
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM "Product"
      WHERE "deletedAt" IS NULL
        AND "quantity" <= "lowStockMargin"
    `,
  ]);

  return {
    totalRevenue: salesMetrics._sum.totalAmount ?? 0,
    totalOrders: salesMetrics._count.id ?? 0,
    activeCashiers,
    lowStockItems: Number(lowStockItems[0].count),
    dateRange: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    // Read the X-User-Id header set by the middleware
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);

    if (user.role === Role.CASHIER) {
      const analytics = await handleCashierAnalytics(userId);
      return NextResponse.json({ analytics });
    } else {
      // Managers/Admins
      const fromParam = url.searchParams.get("from");
      const toParam = url.searchParams.get("to");

      if (!fromParam || !toParam) {
        return NextResponse.json(
          { error: "Missing required parameters: from and to dates" },
          { status: 400 }
        );
      }

      const from = new Date(fromParam);
      const to = new Date(toParam);

      // Validate dates
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Use ISO 8601 format." },
          { status: 400 }
        );
      }

      if (from > to) {
        return NextResponse.json(
          { error: "From date cannot be after to date" },
          { status: 400 }
        );
      }

      const analytics = await handleManagerAnalytics(from, to);
      return NextResponse.json({ analytics });
    }
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}
