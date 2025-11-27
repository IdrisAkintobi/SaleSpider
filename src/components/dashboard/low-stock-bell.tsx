"use client";

import { Bell, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLowStock } from "@/hooks/use-low-stock";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function LowStockBell() {
  const { data: lowStockProducts = [], isLoading } = useLowStock();
  const router = useRouter();
  const t = useTranslation();
  const [open, setOpen] = useState(false);

  const count = lowStockProducts.length;

  const handleProductClick = (productName: string) => {
    setOpen(false);
    // Navigate to inventory page with product name in search
    router.push(
      `/dashboard/inventory?productName=${encodeURIComponent(productName)}`
    );
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={t("low_stock_alerts")}
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {count > 99 ? "99+" : count}
            </Badge>
          )}
          <span className="sr-only">
            {count} {t("low_stock_items")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-orange-50 dark:bg-orange-950/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            <h3 className="font-semibold text-foreground">
              {t("low_stock_alerts")}
            </h3>
          </div>
          <Badge variant="destructive" className="font-semibold">
            {count}
          </Badge>
        </div>

        {count === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("all_items_well_stocked")}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-2">
              {lowStockProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.name)}
                  className="w-full text-left p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-all border border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-red-600 dark:text-red-500">
                          {product.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          left
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-500 font-medium">
                        Threshold: {product.lowStockMargin}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {count > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/inventory");
              }}
            >
              {t("view_all_inventory")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
