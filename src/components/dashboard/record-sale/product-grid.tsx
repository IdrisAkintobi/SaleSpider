import { useRef, useCallback } from "react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface ProductGridProps {
  readonly products: readonly Product[];
  readonly loading: boolean;
  readonly hasMore: boolean;
  readonly onLoadMore: () => void;
  readonly onSelectProduct: (product: Product) => void;
  readonly formatCurrency: (value: number) => string;
  readonly searchTerm?: string;
  readonly disabled?: boolean;
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
}: Readonly<ProductGridProps>) {
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
          products.map((product) => {
            // Determine stock status styles without nested ternaries
            let stockClass = "";
            if (product.quantity > 10) {
              stockClass = "bg-green-100 text-green-800";
            } else if (product.quantity > 0) {
              stockClass = "bg-yellow-100 text-yellow-800";
            } else {
              stockClass = "bg-red-100 text-red-800";
            }

            const isDisabled = product.quantity === 0;
            const handleClick = () => {
              if (!isDisabled) onSelectProduct(product);
            };
            const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
              if (isDisabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectProduct(product);
              }
            };

            return (
            <div
              key={product.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isDisabled
                  ? "bg-muted/50 opacity-50 cursor-not-allowed"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
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
                    <span className={`text-xs px-2 py-1 rounded-full ${stockClass}`}>
                      Stock: {product.quantity}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) onSelectProduct(product);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            );
          })
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
