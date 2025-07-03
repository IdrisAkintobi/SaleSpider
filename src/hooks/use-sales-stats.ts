import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageSale: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
}

async function fetchSalesStats(dateRange?: DateRange): Promise<SalesStats> {
  const params = new URLSearchParams();
  if (dateRange?.from) params.set("from", dateRange.from.toISOString());
  if (dateRange?.to) params.set("to", dateRange.to.toISOString());
  const res = await fetch(`/api/sales/stats?${params.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch sales stats");
  }
  return res.json();
}

export function useSalesStats(dateRange?: DateRange) {
  return useQuery<SalesStats, Error>({
    queryKey: ["sales-stats", dateRange],
    queryFn: () => fetchSalesStats(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 