"use client";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/auth-context";
import useDebounce from "@/hooks/use-debounce";
import type { Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { AddProductDialog } from "./add-product-dialog";
import { ProductTable, type SortField, type SortOrder } from "./product-table";
import { ProductTableSkeleton } from "./product-table-skeleton";
import { SearchInput } from "./search-input";
import { UpdateProductDialog } from "./update-product-dialog";
import { ProductDetailsDialog } from "./product-details-dialog";
import { UpdateStockDialog } from "./update-stock-dialog";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

// Define the expected API response structure
interface ProductsResponse {
  products: Product[];
  totalCount: number;
}

export default function InventoryPage() {
  const { userIsManager } = useAuth();
  const t = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1); // 1-based for TablePagination
  const [pageSize, setPageSize] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdateProductDialogOpen, setIsUpdateProductDialogOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] =
    useState<Product | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
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
        `/api/products?page=${page}&pageSize=${pageSize}${
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

  const products = data?.products ?? [];
  const total = data?.totalCount ?? 0;

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
      setPage(1); // Reset to first page when changing sort
    },
    [sortField, sortOrder]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
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

  const handleOpenDetailsDialog = useCallback((product: Product) => {
    setSelectedProductForDetails(product);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleCloseDetailsDialog = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setSelectedProductForDetails(null);
  }, []);

  // Record New Sale button for cashiers
  const recordSaleAction = !userIsManager ? (
    <Button size="lg" asChild>
      <Link href="/dashboard/record-sale">
        <DollarSign className="mr-2 h-5 w-5" /> {t("record_sale")}
      </Link>
    </Button>
  ) : null;

  if (isError) return <div>Error loading products.</div>;

  return (
    <>
      <PageHeader
        title={t("inventory")}
        description={t("inventory_management_description")}
        actions={
          <>
            {recordSaleAction}
            {userIsManager && (
            <AddProductDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
                triggerButtonProps={{ variant: "default", size: "lg" }}
            />
            )}
          </>
        }
      />

      <SearchInput
        value={searchTerm}
        onChange={handleSearchChange}
        isLoading={isFetching}
      />

      {isLoading ? (
        <ProductTableSkeleton userIsManager={userIsManager} />
      ) : (
        <ProductTable
          products={products}
          userIsManager={userIsManager}
          onUpdateStock={handleOpenUpdateDialog}
          onUpdateProduct={handleOpenUpdateProductDialog}
          onShowDetails={handleOpenDetailsDialog}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
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

      <ProductDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={handleCloseDetailsDialog}
        product={selectedProductForDetails}
      />
    </>
  );
}
