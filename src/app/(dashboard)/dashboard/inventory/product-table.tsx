import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GenericTable, GenericTableColumn } from "@/components/ui/generic-table";
import type { Product } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ArrowDown,
  ArrowUp,
  XCircle,
  Trash2,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/contexts/auth-context";
import { useDeleteProduct, useRestoreProduct } from "@/hooks/use-delete-product";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SortField = "name" | "price" | "quantity" | "updatedAt";
export type SortOrder = "asc" | "desc";

interface ProductTableProps {
  products: Product[];
  userIsManager: boolean;
  onUpdateStock: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function ProductTable({
  products,
  userIsManager,
  onUpdateStock,
  onUpdateProduct,
  sortField,
  sortOrder,
  onSort,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: Readonly<ProductTableProps>) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  // Define columns for the generic table
  const columns: GenericTableColumn<Product>[] = [
    {
      key: "imageUrl",
      label: t("image"),
      align: "left",
    },
    {
      key: "name",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("name")}>{t("name")} {sortField === "name" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("name"),
    },
    {
      key: "price",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("price")}>{t("price")} {sortField === "price" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("price"),
    },
    {
      key: "quantity",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("quantity")}>{t("stock")} {sortField === "quantity" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("quantity"),
    },
    {
      key: "status",
      label: t("status"),
    },
    {
      key: "updatedAt",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("updatedAt")}>{t("date_updated")} {sortField === "updatedAt" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("updatedAt"),
    },
  ];
  if (userIsManager) {
    columns.push({
      key: "actions",
      label: <span className="text-right">{t("actions")}</span>,
      align: "right",
    });
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <GenericTable
          columns={columns}
          data={products}
          rowKey={(row) => row.id}
          renderCell={(product, col) => {
            switch (col.key) {
              case "imageUrl":
                return (
                  <Image
                    src={product.imageUrl ?? "https://placehold.co/64x64.png?text=N/A"}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                  />
                );
              case "name":
                return (
                  <div className="flex items-center gap-2">
                    <span 
                      className={cn(
                        "font-medium cursor-pointer",
                        product.deletedAt && "line-through text-muted-foreground"
                      )} 
                      onClick={() => onUpdateProduct(product)}
                    >
                      {product.name}
                    </span>
                    {product.deletedAt && (
                      <Badge variant="secondary" className="text-xs">
                        Deleted
                      </Badge>
                    )}
                  </div>
                );
              case "price":
                return formatCurrency(product.price);
              case "quantity":
                return product.quantity;
              case "status":
                return product.quantity <= product.lowStockMargin ? (
                  <Badge variant="destructive" className="items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Low Stock
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 items-center gap-1 text-white">
                    <CheckCircle2 className="h-3 w-3" /> In Stock
                  </Badge>
                );
              case "updatedAt":
                return product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "";
              case "actions":
                return userIsManager ? (
                  <ProductActionsDropdown 
                    product={product} 
                    onUpdateStock={onUpdateStock}
                    onUpdateProduct={onUpdateProduct}
                  />
                ) : null;
              default:
                return (product as any)[col.key];
            }
          }}
          emptyMessage={t("no_products_found")}
          paginationProps={
            typeof page === "number" && typeof pageSize === "number" && typeof total === "number" && onPageChange && onPageSizeChange
              ? { page, pageSize, total, onPageChange, onPageSizeChange }
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}

// Product Actions Dropdown Component
interface ProductActionsDropdownProps {
  product: Product;
  onUpdateStock: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
}

function ProductActionsDropdown({ product, onUpdateStock, onUpdateProduct }: ProductActionsDropdownProps) {
  const { user } = useAuth();
  const t = useTranslation();
  const deleteProductMutation = useDeleteProduct();
  const restoreProductMutation = useRestoreProduct();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isDeleted = !!product.deletedAt;

  const handleDelete = () => {
    deleteProductMutation.mutate(product.id);
  };

  const handleRestore = () => {
    restoreProductMutation.mutate(product.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isDeleted && (
          <>
            <DropdownMenuItem onClick={() => onUpdateStock(product)}>
              <Edit3 className="mr-2 h-4 w-4" />
              {t("update_stock")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateProduct(product)}>
              <Edit3 className="mr-2 h-4 w-4" />
              {t("edit_product")}
            </DropdownMenuItem>
            {isSuperAdmin && (
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete_product")}
              </DropdownMenuItem>
            )}
          </>
        )}
        {isDeleted && isSuperAdmin && (
          <DropdownMenuItem onClick={() => setShowRestoreDialog(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("restore_product")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action can be undone by restoring the product later.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        title="Restore Product"
        description={`Are you sure you want to restore "${product.name}"? This will make the product available again.`}
        confirmText="Restore"
        cancelText="Cancel"
        onConfirm={handleRestore}
        variant="default"
      />
    </DropdownMenu>
  );
}
