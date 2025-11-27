import { Skeleton } from "@/components/ui/skeleton";
import { GenericTableSkeleton } from "@/components/ui/generic-table-skeleton";

interface SalesTableSkeletonProps {
  rows?: number;
}

export function SalesTableSkeleton({
  rows = 10,
}: Readonly<SalesTableSkeletonProps>) {
  const columns = [
    {
      header: "order_id",
      cellSkeleton: <Skeleton className="h-4 w-[80px]" />,
    },
    {
      header: "cashier",
      cellSkeleton: <Skeleton className="h-4 w-[100px]" />,
    },
    {
      header: "items",
      cellSkeleton: <Skeleton className="h-4 w-[40px]" />,
    },
    {
      header: "total_amount",
      cellSkeleton: <Skeleton className="h-4 w-[80px]" />,
    },
    {
      header: "payment_mode",
      cellSkeleton: <Skeleton className="h-5 w-[80px] rounded-full" />,
    },
    {
      header: "date",
      cellSkeleton: <Skeleton className="h-4 w-[80px]" />,
    },
    {
      header: "actions",
      cellSkeleton: <Skeleton className="h-8 w-[60px] ml-auto" />,
      className: "text-right",
    },
  ];

  return <GenericTableSkeleton rows={rows} columns={columns} />;
}
