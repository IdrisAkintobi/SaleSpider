import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!product) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t("product_details")}: {product.name}
              {product.deletedAt && (
                <Badge variant="secondary" className="text-xs">{t("deleted")}</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {t("view_product_information")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="flex items-start gap-4">
              <button 
                type="button"
                className="w-24 h-24 flex-shrink-0 bg-muted rounded-md cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => setImagePreview(product.imageUrl ?? "https://placehold.co/120x120.png?text=N/A")}
                aria-label={`${t("view_full_image")}: ${product.name}`}
              >
                <Image
                  src={product.imageUrl ?? "https://placehold.co/120x120.png?text=N/A"}
                  alt={product.name}
                  width={96}
                  height={96}
                  className="rounded-md object-contain border w-full h-full"
                />
              </button>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="text-muted-foreground">{t("category")}</div>
                <div>{product.category}</div>
                <div className="text-muted-foreground">{t("price")}</div>
                <div>{formatCurrency(product.price)}</div>
                <div className="text-muted-foreground">{t("stock")}</div>
                <div>{product.quantity}</div>
                <div className="text-muted-foreground">{t("low_stock_margin")}</div>
                <div>{product.lowStockMargin}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">{t("description")}</div>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {product.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {product.gtin && (
                <>
                  <div className="text-muted-foreground">GTIN</div>
                  <div>{product.gtin}</div>
                </>
              )}
              <div className="text-muted-foreground">{t("date_updated")}</div>
              <div>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "-"}</div>
              <div className="text-muted-foreground">{t("created_at")}</div>
              <div>{product.createdAt ? new Date(product.createdAt).toLocaleString() : "-"}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
          <div className="relative w-full h-[80vh] bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setImagePreview(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Product preview"
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
