import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetch-utils";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

type Period = "today" | "week" | "month" | "year";

interface DateRange {
  from: Date;
  to: Date;
}

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

type DashboardAnalytics = ManagerAnalytics | CashierAnalytics;

interface DashboardAnalyticsResponse {
  analytics: DashboardAnalytics;
}

function getDateRangeForPeriod(period: Period): DateRange {
  const now = new Date();

  switch (period) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "year":
      return { from: startOfYear(now), to: endOfYear(now) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
}

export function useDashboardAnalytics(period?: Period) {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics", period],
    queryFn: async () => {
      let url = "/api/dashboard/analytics";

      // For managers, add date range parameters
      if (period) {
        const dateRange = getDateRangeForPeriod(period);
        const searchParams = new URLSearchParams({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        });
        url += `?${searchParams.toString()}`;
      }

      const response = await fetchJson<DashboardAnalyticsResponse>(url);
      return response.analytics;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
  });
}
