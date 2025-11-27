import { handleException, jsonError, jsonOk } from "@/lib/api-response";
import { createChildLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getMonthlySales } from "@/lib/utils";
import { NextRequest } from "next/server";

const logger = createChildLogger("api:sales:stats");

// Helper: Build date range where clause
function buildDateRangeWhere(from?: Date, to?: Date) {
  const where: any = { deletedAt: null };

  if (from && to) {
    where.createdAt = { gte: from, lte: to };
  } else if (from) {
    where.createdAt = { gte: from };
  } else if (to) {
    where.createdAt = { lte: to };
  }

  return where;
}

// Helper: Get stats for custom date range
async function getCustomRangeStats(from?: Date, to?: Date) {
  const rangeWhere = buildDateRangeWhere(from, to);

  const [todaySales, weekSales, monthSales] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: rangeWhere }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: rangeWhere }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: rangeWhere }),
  ]);

  const monthly = from && to ? await getMonthlySales(prisma, from, to) : [];

  return { todaySales, weekSales, monthSales, monthly };
}

// Helper: Get default time-based stats (today, week, month)
async function getDefaultStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todaySales, weekSales, monthSales, monthly] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { deletedAt: null, createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { deletedAt: null, createdAt: { gte: weekStart } },
    }),
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { deletedAt: null, createdAt: { gte: monthStart } },
    }),
    getMonthlySales(prisma),
  ]);

  return { todaySales, weekSales, monthSales, monthly };
}

// Function to get sales stats
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    // Support for date range filtering
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from")
      ? new Date(searchParams.get("from")!)
      : undefined;
    const to = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : undefined;

    // Total sales value, total orders, average sale value (optionally filtered by date range)
    const aggregateWhere = buildDateRangeWhere(from, to);
    const aggregate = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      _avg: { totalAmount: true },
      where: aggregateWhere,
    });

    // Get period-specific stats based on whether date range is provided
    const hasDateRange = from || to;
    const stats = hasDateRange
      ? await getCustomRangeStats(from, to)
      : await getDefaultStats();

    return jsonOk({
      totalSales: aggregate._sum.totalAmount ?? 0,
      totalOrders: aggregate._count.id ?? 0,
      averageSale: aggregate._avg.totalAmount ?? 0,
      todaySales: stats.todaySales._sum.totalAmount ?? 0,
      weekSales: stats.weekSales._sum.totalAmount ?? 0,
      monthSales: stats.monthSales._sum.totalAmount ?? 0,
      monthly: stats.monthly,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to fetch sales stats"
    );
    return handleException(error, "Failed to fetch sales stats", 500);
  }
}
