import type { Product } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/constants";

export interface GetProductsResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export async function getProducts(
  page: number = 1,
  pageSize: number = PAGE_SIZE,
  search?: string,
  signal?: AbortSignal
): Promise<GetProductsResponse> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search && search.trim()) params.set("search", search.trim());

  const res = await fetch(`/api/products?${params.toString()}`, { signal });
  if (!res.ok) {
    let message = "Failed to fetch products";
    try {
      const error = await res.json();
      if (error?.message) message = error.message;
    } catch {}
    throw new Error(message);
  }

  const data = await res.json();
  return {
    products: data.products,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    hasMore: page < data.totalPages,
  };
}
