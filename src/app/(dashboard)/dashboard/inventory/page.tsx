"use client";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/auth-context";
import useDebounce from "@/hooks/use-debounce";
import type { Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { AddProductDialog } from "./add-product-dialog";
import { PaginationControls } from "./pagination-controls";
import { ProductTable, type SortField, type SortOrder } from "./product-table";
import { ProductTableSkeleton } from "./product-table-skeleton";
import { SearchInput } from "./search-input";
import { UpdateProductDialog } from "./update-product-dialog";
import { UpdateStockDialog } from "./update-stock-dialog";

// Define the expected API response structure
interface ProductsResponse {
  products: Product[];
  totalCount: number;
}

export default function InventoryPage() {
  const { userIsManager } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdateProductDialogOpen, setIsUpdateProductDialogOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] =
    useState<Product | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { data, isLoading, isError, isFetching } = useQuery<ProductsResponse>({
    queryKey: [
      "products",
      page,
      pageSize,
      debouncedSearchTerm,
      sortField,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await fetch(
        `/api/products?page=${page + 1}&pageSize=${pageSize}${
          debouncedSearchTerm
            ? `&search=${encodeURIComponent(debouncedSearchTerm)}`
            : ""
        }&sortField=${sortField}&sortOrder=${sortOrder}`
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const products = data?.products || [];
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
      setPage(0); // Reset to first page when changing sort
    },
    [sortField, sortOrder]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(0); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleOpenUpdateDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsUpdateDialogOpen(true);
  }, []);

  const handleCloseUpdateDialog = useCallback(() => {
    setIsUpdateDialogOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleOpenUpdateProductDialog = useCallback((product: Product) => {
    setSelectedProductForEdit(product);
    setIsUpdateProductDialogOpen(true);
  }, []);

  const handleCloseUpdateProductDialog = useCallback(() => {
    setIsUpdateProductDialogOpen(false);
    setSelectedProductForEdit(null);
  }, []);

  if (isError) return <div>Error loading products.</div>;

  return (
    <>
      <PageHeader
        title="Inventory Management"
        description="View, add, and manage your product stock."
        actions={
          userIsManager && (
            <AddProductDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
            />
          )
        }
      />

      <SearchInput
        value={searchTerm}
        onChange={handleSearchChange}
        isLoading={isFetching}
      />

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {isLoading ? (
        <ProductTableSkeleton userIsManager={userIsManager} />
      ) : (
        <ProductTable
          products={products}
          userIsManager={userIsManager}
          onUpdateStock={handleOpenUpdateDialog}
          onUpdateProduct={handleOpenUpdateProductDialog}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      <UpdateStockDialog
        isOpen={isUpdateDialogOpen}
        onOpenChange={handleCloseUpdateDialog}
        product={selectedProduct}
      />

      <UpdateProductDialog
        isOpen={isUpdateProductDialogOpen}
        onOpenChange={handleCloseUpdateProductDialog}
        product={selectedProductForEdit}
      />
    </>
  );
}
