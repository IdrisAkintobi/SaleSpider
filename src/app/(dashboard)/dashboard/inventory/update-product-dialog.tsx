import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductCategory } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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
          <FormField label="Product Name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>
          <FormField
            label="Product Description"
            error={errors.description?.message}
          >
            <Input id="description" {...register("description")} />
          </FormField>
          <FormField label="Product Category" error={errors.category?.message}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <select
                  id="category"
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {Object.values(ProductCategory).map((category) => (
                    <option key={category} value={category}>
                      {category
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormField>
          <FormField label="Price ($)" error={errors.price?.message}>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              )}
            />
          </FormField>
          <FormField
            label="Low Stock Margin"
            error={errors.lowStockMargin?.message}
          >
            <Controller
              name="lowStockMargin"
              control={control}
              render={({ field }) => (
                <Input
                  id="lowStockMargin"
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              )}
            />
          </FormField>
          <FormField
            label="Image URL (Optional)"
            error={errors.imageUrl?.message}
          >
            <Input
              id="imageUrl"
              {...register("imageUrl")}
              placeholder="https://placehold.co/300x300.png"
            />
          </FormField>
          <FormField label="GTIN (Optional)" error={errors.gtin?.message}>
            <Input id="gtin" {...register("gtin")} />
          </FormField>
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

// Helper component for form fields to reduce repetition
function FormField({
  label,
  error,
  children,
}: Readonly<{
  label: string;
  error?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label
        htmlFor={children && (children as React.ReactElement).props.id}
        className="text-right"
      >
        {label}
      </Label>
      <div className="col-span-3">
        {children}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
}
