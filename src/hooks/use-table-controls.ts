import { useState } from "react";

export interface UseTableControlsOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSort?: string;
  initialOrder?: "asc" | "desc";
}

export function useTableControls({
  initialPage = 1,
  initialPageSize = 10,
  initialSort = "createdAt",
  initialOrder = "desc",
}: UseTableControlsOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sort, setSort] = useState(initialSort);
  const [order, setOrder] = useState<"asc" | "desc">(initialOrder);

  const handleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("asc");
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    order,
    setOrder,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  };
}
