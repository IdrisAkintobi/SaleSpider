"use client";

import { useRef, useCallback } from "react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectProduct: (product: Product) => void;
  formatCurrency: (value: number) => string;
  searchTerm?: string;
  disabled?: boolean;
}

export function ProductGrid({
  products,
  loading,
  hasMore,
  onLoadMore,
  onSelectProduct,
  formatCurrency,
  searchTerm,
  disabled,
}: ProductGridProps) {
  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback(() => {
    if (hasMore && !loading) onLoadMore();
  }, [hasMore, loading, onLoadMore]);

  useIntersectionObserver(
    sentinelRef.current,
    handleIntersect,
    { root: productsScrollRef.current, rootMargin: "100px", threshold: 0.1 }
  );

  return (
    <div className="space-y-4">
      <Label>Available Products</Label>
      <div
        ref={productsScrollRef}
        className={`max-h-96 overflow-y-auto space-y-2 border rounded-md p-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                product.quantity === 0
                  ? "bg-muted/50 opacity-50 cursor-not-allowed"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                if (product.quantity > 0) {
                  onSelectProduct(product);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {product.category}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.quantity > 10
                          ? "bg-green-100 text-green-800"
                          : product.quantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Stock: {product.quantity}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={product.quantity === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.quantity > 0) onSelectProduct(product);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No products found matching your search." : "No products available."}
          </div>
        )}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Loading more products...
            </div>
          </div>
        )}
        <div ref={sentinelRef} />
      </div>
    </div>
  );
}
