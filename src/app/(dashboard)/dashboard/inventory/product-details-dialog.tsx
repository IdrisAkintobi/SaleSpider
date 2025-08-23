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

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailsDialog({ isOpen, onOpenChange, product }: Readonly<ProductDetailsDialogProps>) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
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
            <Image
              src={product.imageUrl ?? "https://placehold.co/120x120.png?text=N/A"}
              alt={product.name}
              width={96}
              height={96}
              className="rounded-md object-cover border"
            />
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
  );
}
