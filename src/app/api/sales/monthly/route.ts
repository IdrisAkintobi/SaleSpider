import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Get the first day of the current month
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Go back 5 more months
    startMonth.setMonth(startMonth.getMonth() - 5);
    startMonth.setHours(0, 0, 0, 0);

    // Prepare an array of month start dates
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(startMonth);
      d.setMonth(startMonth.getMonth() + i);
      return d;
    });

    // For each month, get sales total
    const results = await Promise.all(
      months.map(async (monthStart, i) => {
        const nextMonth = new Date(monthStart);
        nextMonth.setMonth(monthStart.getMonth() + 1);
        const sales = await prisma.sale.aggregate({
          _sum: { totalAmount: true },
          where: {
            deletedAt: null,
            createdAt: {
              gte: monthStart,
              lt: nextMonth,
            },
          },
        });
        return {
          month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
          sales: sales._sum.totalAmount || 0,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    return NextResponse.json(
      { message: "Failed to fetch monthly sales" },
      { status: 500 }
    );
  }
} 