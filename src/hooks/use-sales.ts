import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Sale, SaleItem, PaymentMode } from "@/lib/types";

async function fetchSalesData() {
  const res = await fetch("/api/sales");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch sales");
  }
  return res.json() as Promise<Sale[]>;
}

async function createSale(saleData: {
  cashierId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMode: PaymentMode;
}) {
  const res = await fetch("/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to record sale");
  }
  return res.json();
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSalesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      // Invalidate and refetch sales data after successful sale
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
} 