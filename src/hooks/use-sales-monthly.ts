import { useQuery } from "@tanstack/react-query";

export interface MonthlySales {
  month: string; // 'YYYY-MM'
  sales: number;
}

async function fetchSalesMonthly(): Promise<MonthlySales[]> {
  const res = await fetch("/api/sales/monthly");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch monthly sales");
  }
  return res.json();
}

export function useSalesMonthly() {
  return useQuery<MonthlySales[], Error>({
    queryKey: ["sales-monthly"],
    queryFn: fetchSalesMonthly,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 