import { GenericTableSkeleton } from "@/components/ui/generic-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductTableSkeletonProps {
  userIsManager: boolean;
  rows?: number;
}

export function ProductTableSkeleton({
  userIsManager,
  rows = 5,
}: Readonly<ProductTableSkeletonProps>) {
  const columns = [
    {
      header: "image",
      cellSkeleton: <Skeleton className="h-12 w-12 rounded-md" />,
    },
    {
      header: "name",
      cellSkeleton: <Skeleton className="h-4 w-[150px]" />,
    },
    {
      header: "price",
      cellSkeleton: <Skeleton className="h-4 w-[60px]" />,
    },
    {
      header: "stock",
      cellSkeleton: <Skeleton className="h-4 w-[40px]" />,
    },
    {
      header: "status",
      cellSkeleton: <Skeleton className="h-6 w-[80px] rounded-full" />,
    },
    {
      header: "date_added",
      cellSkeleton: <Skeleton className="h-4 w-[100px]" />,
    },
  ];

  if (userIsManager) {
    columns.push({
      header: "actions",
      cellSkeleton: (
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-[60px]" />
          <Skeleton className="h-8 w-[60px]" />
        </div>
      ),
    });
  }

  return <GenericTableSkeleton rows={rows} columns={columns} />;
}
