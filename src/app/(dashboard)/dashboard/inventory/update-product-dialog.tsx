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
import { ProductCategory } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Product description is required"),
  price: z.number().min(0.01, "Price must be positive"),
  category: z.nativeEnum(ProductCategory),
  lowStockMargin: z
    .number()
    .int()
    .min(0, "Low stock margin cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  gtin: z.string().optional(),
});

type UpdateProductFormData = z.infer<typeof updateProductSchema>;

interface UpdateProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function UpdateProductDialog({
  isOpen,
  onOpenChange,
  product,
}: Readonly<UpdateProductDialogProps>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
  });

  const originalValuesRef = useRef<Partial<Product> | null>(null);

  React.useEffect(() => {
    if (product) {
      originalValuesRef.current = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        lowStockMargin: product.lowStockMargin,
        imageUrl: product.imageUrl ?? "",
        gtin: product.gtin ?? "",
      };

      reset(originalValuesRef.current);
    }
  }, [product, reset]);

  const updateProductMutation = useMutation({
    mutationFn: async (updateData: UpdateProductFormData & { id: string }) => {
      const { id, ...data } = updateData;

      // Filter out unchanged fields
      const originalValues = originalValuesRef.current ?? {};
      const updatedData = Object.keys(data).reduce((acc, key) => {
        const objKey = key as keyof UpdateProductFormData;
        if (data[objKey] !== originalValues[objKey]) {
          acc[objKey] = data[objKey];
        }
        return acc;
      }, {} as Record<string, any>);

      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error("Failed to update product");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Updated",
        description: "Product details updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProduct: SubmitHandler<UpdateProductFormData> = (data) => {
    if (product) {
      updateProductMutation.mutate({
        ...data,
        id: product.id,
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Product: {product.name}</DialogTitle>
          <DialogDescription>
            Update the product details below.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleUpdateProduct)}
          className="grid gap-4 py-4"
        >
          <FormInput
            label="Product Name"
            name="name"
            register={register}
            error={errors.name?.message}
          />
          <FormInput
            label="Product Description"
            name="description"
            register={register}
            error={errors.description?.message}
          />
          <FormInput
            label="Product Category"
            name="category"
            control={control}
            error={errors.category?.message}
          />
          <FormInput
            label="Price ($)"
            name="price"
            type="number"
            control={control}
            error={errors.price?.message}
          />
          <FormInput
            label="Low Stock Margin"
            name="lowStockMargin"
            type="number"
            control={control}
            error={errors.lowStockMargin?.message}
          />
          <FormInput
            label="Image URL (Optional)"
            name="imageUrl"
            register={register}
            placeholder="https://placehold.co/300x300.png"
            error={errors.imageUrl?.message}
          />
          <FormInput
            label="GTIN (Optional)"
            name="gtin"
            register={register}
            error={errors.gtin?.message}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending
                ? "Updating..."
                : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
