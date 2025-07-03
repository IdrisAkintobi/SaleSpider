import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Sale, SaleItem, PaymentMode } from "@/lib/types";

export interface UseSalesParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: string;
  searchTerm?: string;
}

export interface SaleQueryResult {
  data: Sale[];
  total: number;
}

async function fetchSalesData(params: UseSalesParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.searchTerm) query.set("search", params.searchTerm);
  const res = await fetch(`/api/sales?${query.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch sales");
  }
  return res.json() as Promise<SaleQueryResult>;
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

export function useSales(params: UseSalesParams = {}) {
  return useQuery<SaleQueryResult, Error>({
    queryKey: ["sales", params],
    queryFn: () => fetchSalesData(params),
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