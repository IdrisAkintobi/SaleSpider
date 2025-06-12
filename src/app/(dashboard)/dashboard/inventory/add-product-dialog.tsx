import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductCategory } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Product description is required"),
  price: z.number().min(0.01, "Price must be positive"),
  category: z.nativeEnum(ProductCategory),
  quantity: z.number().int().min(1, "Quantity cannot be less than one"),
  lowStockMargin: z
    .number()
    .int()
    .min(0, "Low stock margin cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  gtin: z.string().optional(),
});
// Get defaults by parsing an empty object
const defaultValues = productSchema.safeParse({});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({
  isOpen,
  onOpenChange,
}: AddProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0.01,
      quantity: 12,
      lowStockMargin: 0,
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProductData: ProductFormData) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProductData),
      });
      if (!res.ok) {
        throw new Error("Failed to add product");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Added",
        description: "New product added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddProduct: SubmitHandler<ProductFormData> = (data) => {
    addProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details for the new product.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleAddProduct)}
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
                  //   value={field.value ?? 0.09}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0.01)
                  }
                />
              )}
            />
          </FormField>
          <FormField label="Initial Quantity" error={errors.quantity?.message}>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input
                  id="quantity"
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
            <Button type="submit" disabled={addProductMutation.isPending}>
              {addProductMutation.isPending ? "Adding..." : "Add Product"}
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
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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
