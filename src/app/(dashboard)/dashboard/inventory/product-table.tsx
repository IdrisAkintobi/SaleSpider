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
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { useFormatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";

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
      label: "Image",
      align: "left",
    },
    {
      key: "name",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("name")}>Name {sortField === "name" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("name"),
    },
    {
      key: "price",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("price")}>Price {sortField === "price" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("price"),
    },
    {
      key: "quantity",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("quantity")}>Stock {sortField === "quantity" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("quantity"),
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "updatedAt",
      label: (
        <div className="flex items-center cursor-pointer" onClick={() => onSort?.("updatedAt")}>Date Updated {sortField === "updatedAt" && (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
      ),
      sortable: true,
      onSort: () => onSort?.("updatedAt"),
    },
  ];
  if (userIsManager) {
    columns.push({
      key: "actions",
      label: <span className="text-right">Actions</span>,
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
                  <span className="font-medium cursor-pointer" onClick={() => onUpdateProduct(product)}>
                    {product.name}
                  </span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStock(product)}
                  >
                    <Edit3 className="mr-2 h-3 w-3" /> {t("update_stock")}
                  </Button>
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
