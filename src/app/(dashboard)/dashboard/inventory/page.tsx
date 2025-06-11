"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  PackageSearch,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import useDebounce from '@/hooks/use-debounce';

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be positive"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockMargin: z
    .number()
    .int()
    .min(0, "Low stock margin cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  gtin: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const stockUpdateSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});
type StockUpdateFormData = z.infer<typeof stockUpdateSchema>;

// Define the expected API response structure
interface ProductsResponse {
  products: Product[];
  totalCount: number;
}

export default function InventoryPage() {
  const { userIsManager } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce with a 500ms delay
  const [page, setPage] = useState(0); // Start with page 0 for easier calculation with skip/take
  const [pageSize] = useState(10); // Assuming a fixed page size for now
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, isError } = useQuery<ProductsResponse>({
    queryKey: ["products", page, pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const res = await fetch(
        `/api/products?page=${page + 1}&pageSize=${pageSize}${
          searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
        }`
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const products = data?.products || [];
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const stockForm = useForm<StockUpdateFormData>({
    resolver: zodResolver(stockUpdateSchema),
  });

  const queryClient = useQueryClient();

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
        description: "New product added successfully." 
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error adding product", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleAddProduct: SubmitHandler<ProductFormData> = (data) => {
    addProductMutation.mutate(data);
  };

  const handleOpenUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    stockForm.reset({ quantity: product.quantity });
    setIsUpdateDialogOpen(true);
  };

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
        description: "Product stock updated successfully." 
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsUpdateDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast({ 
        title: "Error updating stock", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleUpdateStock: SubmitHandler<StockUpdateFormData> = (data) => {
    if (selectedProduct) {
      updateStockMutation.mutate({ id: selectedProduct.id, quantity: data.quantity });
    }
  };

  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Error loading products.</div>;

  return (
    <>
      <PageHeader
        title="Inventory Management"
        description="View, add, and manage your product stock."
        actions={
          userIsManager && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  {/* Form Fields: Name, Price, Quantity, Low Stock Margin, Image URL */}
                  <FormField label="Product Name" error={errors.name?.message}>
                    <Input id="name" {...register("name")} />
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
                    label="Initial Quantity"
                    error={errors.quantity?.message}
                  >
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
                  <FormField
                    label="GTIN (Optional)"
                    error={errors.gtin?.message}
                  >
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
          )
        }
      />
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <PackageSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end items-center space-x-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                {userIsManager && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={
                          product.imageUrl ||
                          "https://placehold.co/64x64.png?text=N/A"
                        }
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                        data-ai-hint="product item"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      {product.quantity <= product.lowStockMargin ? (
                        <Badge
                          variant="destructive"
                          className="items-center gap-1"
                        >
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 items-center gap-1 text-white"
                        >
                          <CheckCircle2 className="h-3 w-3" /> In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(product.dateAdded).toLocaleDateString()}
                    </TableCell>
                    {userIsManager && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenUpdateDialog(product)}
                        >
                          <Edit3 className="mr-2 h-3 w-3" /> Update Stock
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={userIsManager ? 7 : 6}
                    className="h-24 text-center"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedProduct && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Stock for {selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Enter the new stock quantity.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={stockForm.handleSubmit(handleUpdateStock)}
              className="grid gap-4 py-4"
            >
              <FormField
                label="New Quantity"
                error={stockForm.formState.errors.quantity?.message}
              >
                <Controller
                  name="quantity"
                  control={stockForm.control}
                  render={({ field }) => (
                    <Input
                      id="updateQuantity"
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  )}
                />
              </FormField>
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
      )}
    </>
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