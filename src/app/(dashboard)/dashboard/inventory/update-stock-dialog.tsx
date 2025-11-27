import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/custom-form-input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductMutation } from "@/hooks/use-product-mutation";
import type { Product } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import { useTranslation } from "@/lib/i18n";

const DEFAULT_RESTOCK_QUANTITY = 12;

const stockUpdateSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

type StockUpdateFormData = z.infer<typeof stockUpdateSchema>;

interface UpdateStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function UpdateStockDialog({
  isOpen,
  onOpenChange,
  product,
}: Readonly<UpdateStockDialogProps>) {
  const stockForm = useForm<StockUpdateFormData>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: { quantity: DEFAULT_RESTOCK_QUANTITY },
  });
  const t = useTranslation();

  const updateStockMutation = useProductMutation(
    "Stock Updated",
    "Product stock updated successfully.",
    "Error updating stock",
    onOpenChange
  );

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      stockForm.reset({ quantity: DEFAULT_RESTOCK_QUANTITY });
    }
  }, [isOpen, stockForm]);

  // Usage in component
  const handleStockUpdate: SubmitHandler<StockUpdateFormData> = data => {
    if (product) {
      updateStockMutation.mutate({
        id: product.id,
        data,
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("update_stock") + ": " + product.name}</DialogTitle>
          <DialogDescription>{t("update_stock_description")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={stockForm.handleSubmit(handleStockUpdate)}
          className="grid gap-4 py-4"
        >
          <FormInput
            label={t("quantity")}
            name="quantity"
            type="number"
            control={stockForm.control}
            error={stockForm.formState.errors.quantity?.message}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateStockMutation.isPending}>
              {updateStockMutation.isPending
                ? t("updating")
                : t("update_stock")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
