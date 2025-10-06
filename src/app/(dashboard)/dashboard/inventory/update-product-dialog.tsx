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
import type { Product, ProductUpdateInput } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductCategory } from "@prisma/client";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { useCurrencySettings } from "@/lib/currency";

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
  const { currencySymbol } = useCurrencySettings();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        lowStockMargin: product.lowStockMargin,
        imageUrl: product.imageUrl ?? "",
        gtin: product.gtin ?? "",
      });
    }
  }, [product, reset]);

  const updateProductMutation = useProductMutation(
    "Product Updated",
    "Product details updated successfully.",
    "Error updating product",
    onOpenChange
  );

  const handleProductUpdate: SubmitHandler<UpdateProductFormData> = (
    updateData
  ) => {
    if (product) {
      // Filter out unchanged fields and only include allowed updatable fields
      const updatedData: ProductUpdateInput = {};
      const keys: (keyof ProductUpdateInput)[] = [
        "name",
        "description",
        "category",
        "price",
        "lowStockMargin",
        "imageUrl",
        "gtin",
      ];
      for (const key of keys) {
        const newValue = updateData[key as keyof UpdateProductFormData] as ProductUpdateInput[typeof key];
        const oldValue = (product as Pick<Product, keyof ProductUpdateInput>)[key];
        if (newValue !== undefined && newValue !== oldValue) {
          // assign only when changed
          (updatedData as any)[key] = newValue;
        }
      }

      updateProductMutation.mutate({
        id: product.id,
        data: updatedData,
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
          key={product.id}
          onSubmit={handleSubmit(handleProductUpdate)}
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
            type="select"
            control={control}
            options={Object.values(ProductCategory)}
            error={errors.category?.message}
          />
          <FormInput
            label={`Price (${currencySymbol})`}
            name="price"
            type="number"
            step="0.01"
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
            disabled={!!(product.gtin && product.gtin.trim())}
            placeholder={product.gtin && product.gtin.trim() ? "GTIN cannot be changed once set" : "Enter GTIN"}
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
