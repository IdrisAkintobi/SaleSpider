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
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stockForm = useForm<StockUpdateFormData>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: { quantity: DEFAULT_RESTOCK_QUANTITY },
  });

  React.useEffect(() => {
    if (product) {
      stockForm.reset({ quantity: product.quantity });
    }
  }, [product, stockForm]);

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        throw new Error("Failed to update stock");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Stock Updated",
        description: "Product stock updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStock: SubmitHandler<StockUpdateFormData> = (data) => {
    if (product) {
      updateStockMutation.mutate({
        id: product.id,
        quantity: data.quantity,
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stock for {product.name}</DialogTitle>
          <DialogDescription>Enter the new stock quantity.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={stockForm.handleSubmit(handleUpdateStock)}
          className="grid gap-4 py-4"
        >
          <FormInput
            label="New Quantity"
            name="quantity"
            control={stockForm.control}
            error={stockForm.formState.errors.quantity?.message}
            onChange={(value) =>
              stockForm.setValue("quantity", parseInt(value, 10) || 0)
            }
            type="number"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateStockMutation.isPending}>
              {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
