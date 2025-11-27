import { useQuery } from "@tanstack/react-query";

export interface MonthlySales {
  month: string; // 'YYYY-MM'
  sales: number;
}

async function fetchSalesMonthly(): Promise<MonthlySales[]> {
  const res = await fetch("/api/sales/monthly");
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "Failed to fetch monthly sales";
    try {
      const error = JSON.parse(text);
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const text = await res.text();
  if (!text || text.trim() === "") {
    throw new Error(
      "Server returned an empty response. Please check if the API is running correctly."
    );
  }

  try {
    return JSON.parse(text) as MonthlySales[];
  } catch {
    throw new Error(
      "Server returned invalid data. Please try again or contact support if the issue persists."
    );
  }
}

export function useSalesMonthly() {
  return useQuery<MonthlySales[], Error>({
    queryKey: ["sales-monthly"],
    queryFn: fetchSalesMonthly,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
