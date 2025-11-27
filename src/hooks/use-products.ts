import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/constants";
import { getProducts } from "@/lib/api/products";
import useDebounce from "@/hooks/use-debounce";

interface UseProductsOptions {
  pageSize?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const pageSize = options.pageSize ?? PAGE_SIZE;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Initial + search loads
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        const result = await getProducts(
          1,
          pageSize,
          debouncedSearch,
          controller.signal
        );
        setProducts(result.products.filter(p => p.quantity > 0));
        setHasMore(result.hasMore);
        setCurrentPage(1);
      } catch {
        // Let caller handle toasts if needed
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [debouncedSearch, pageSize]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      const result = await getProducts(nextPage, pageSize, debouncedSearch);
      setProducts(prev => [
        ...prev,
        ...result.products.filter(p => p.quantity > 0),
      ]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, pageSize, debouncedSearch]);

  const refresh = useCallback(async () => {
    const result = await getProducts(1, pageSize, debouncedSearch);
    setProducts(result.products.filter(p => p.quantity > 0));
    setHasMore(result.hasMore);
    setCurrentPage(1);
  }, [pageSize, debouncedSearch]);

  return {
    products,
    hasMore,
    loading,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    loadMore,
    refresh,
  } as const;
}
