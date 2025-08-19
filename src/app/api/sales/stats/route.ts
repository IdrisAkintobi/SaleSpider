import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getMonthlySales } from "@/lib/utils";
import { createChildLogger } from "@/lib/logger";

const prisma = new PrismaClient();
const logger = createChildLogger('api:sales:stats');

// Function to get sales stats
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Support for date range filtering
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
    const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

    const aggregateWhere: any = { deletedAt: null };
    if (from && to) {
      aggregateWhere.createdAt = { gte: from, lte: to };
    } else if (from) {
      aggregateWhere.createdAt = { gte: from };
    } else if (to) {
      aggregateWhere.createdAt = { lte: to };
    }

    // Total sales value, total orders, average sale value (optionally filtered by date range)
    const aggregate = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      _avg: { totalAmount: true },
      where: aggregateWhere,
    });

    // Today's sales
    let todaySales: { _sum: { totalAmount: number | null } } = { _sum: { totalAmount: 0 } };
    let weekSales: { _sum: { totalAmount: number | null } } = { _sum: { totalAmount: 0 } };
    let monthSales: { _sum: { totalAmount: number | null } } = { _sum: { totalAmount: 0 } };
    let monthly: any[] = [];

    if (from || to) {
      // If a date range is provided, use it for all stats
      const rangeWhere: Record<string, any> = { deletedAt: null };
      if (from && to) {
        rangeWhere["createdAt"] = { gte: from, lte: to };
      } else if (from) {
        rangeWhere["createdAt"] = { gte: from };
      } else if (to) {
        rangeWhere["createdAt"] = { lte: to };
      }

      todaySales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: rangeWhere,
      });
      weekSales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: rangeWhere,
      });
      monthSales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: rangeWhere,
      });

      // Monthly stats: group by month within the range
      if (from && to) {
        monthly = await getMonthlySales(prisma, from, to);
      }
    } else {
      // Default logic (no date range)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      todaySales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          deletedAt: null,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      // This week's sales (from Monday)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
      weekStart.setHours(0, 0, 0, 0);
      weekSales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          deletedAt: null,
          createdAt: {
            gte: weekStart,
          },
        },
      });

      // This month's sales
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthSales = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          deletedAt: null,
          createdAt: {
            gte: monthStart,
          },
        },
      });

      // Monthly sales for last 6 months
      monthly = await getMonthlySales(prisma);
    }

    return NextResponse.json({
      totalSales: aggregate._sum.totalAmount ?? 0,
      totalOrders: aggregate._count.id ?? 0,
      averageSale: aggregate._avg.totalAmount ?? 0,
      todaySales: todaySales._sum.totalAmount ?? 0,
      weekSales: weekSales._sum.totalAmount ?? 0,
      monthSales: monthSales._sum.totalAmount ?? 0,
      monthly,
    });
  } catch (error) {
    logger.error({ userId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Error fetching sales stats');
    return NextResponse.json(
      { message: "Failed to fetch sales stats" },
      { status: 500 }
    );
  }
} 