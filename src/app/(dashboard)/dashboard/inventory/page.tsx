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
import { addProduct, getAllProducts, updateProductStock } from "@/lib/data";
import type { Product } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  PackageSearch,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be positive"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockMargin: z
    .number()
    .int()
    .min(0, "Low stock margin cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

const stockUpdateSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});
type StockUpdateFormData = z.infer<typeof stockUpdateSchema>;

export default function InventoryPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

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

  const handleAddProduct: SubmitHandler<ProductFormData> = (data) => {
    addProduct(data);
    setProducts(getAllProducts()); // Refresh products list
    toast({
      title: "Product Added",
      description: `${data.name} has been added to inventory.`,
    });
    reset();
    setIsAddDialogOpen(false);
  };

  const handleOpenUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    stockForm.reset({ quantity: product.quantity });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateStock: SubmitHandler<StockUpdateFormData> = (data) => {
    if (selectedProduct) {
      updateProductStock(selectedProduct.id, data.quantity);
      setProducts(getAllProducts()); // Refresh products list
      toast({
        title: "Stock Updated",
        description: `Stock for ${selectedProduct.name} updated to ${data.quantity}.`,
      });
      setIsUpdateDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  return (
    <>
      <PageHeader
        title="Inventory Management"
        description="View, add, and manage your product stock."
        actions={
          role === "Manager" && (
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
                            field.onChange(parseFloat(e.target.value))
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
                            field.onChange(parseInt(e.target.value, 10))
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
                            field.onChange(parseInt(e.target.value, 10))
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
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Add Product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<PackageSearch className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                {role === "Manager" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                    {role === "Manager" && (
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
                    colSpan={role === "Manager" ? 7 : 6}
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
                        field.onChange(parseInt(e.target.value, 10))
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
                <Button type="submit">Update Stock</Button>
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
