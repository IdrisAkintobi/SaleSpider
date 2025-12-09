import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isCashier(user: User | null) {
  return user?.role === "CASHIER";
}

export function isManager(user: User | null) {
  return user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
}

/**
 * Aggregates sales data for a given date range or filters
 */
export async function aggregateSales(
  prisma: any,
  options?: {
    from?: Date;
    to?: Date;
    cashierId?: string;
    includeDeleted?: boolean;
  }
) {
  const where: any = {};

  if (!options?.includeDeleted) {
    where.deletedAt = null;
  }

  if (options?.cashierId) {
    where.cashierId = options.cashierId;
  }

  if (options?.from || options?.to) {
    where.createdAt = {};
    if (options.from) where.createdAt.gte = options.from;
    if (options.to) where.createdAt.lte = options.to;
  }

  return prisma.sale.aggregate({
    where,
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });
}

/**
 * Returns an array of monthly sales totals for the given range.
 * If from/to are not provided, returns the last 6 months including current.
 */
export async function getMonthlySales(prisma: any, from?: Date, to?: Date) {
  let months: Date[] = [];
  if (from && to) {
    // Range from start of 'from' month to end of 'to' month
    const start = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    const current = new Date(start);
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    // Last 6 months including current
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startMonth.setMonth(startMonth.getMonth() - 5);
    startMonth.setHours(0, 0, 0, 0);
    months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(startMonth);
      d.setMonth(startMonth.getMonth() + i);
      return d;
    });
  }

  return Promise.all(
    months.map(async monthStart => {
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
        month: `${monthStart.getFullYear()}-${String(
          monthStart.getMonth() + 1
        ).padStart(2, "0")}`,
        sales: sales._sum.totalAmount || 0,
      };
    })
  );
}
