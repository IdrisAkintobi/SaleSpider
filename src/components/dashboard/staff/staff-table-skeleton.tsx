import { Skeleton } from "@/components/ui/skeleton";
import { GenericTableSkeleton } from "@/components/ui/generic-table-skeleton";

interface StaffTableSkeletonProps {
  rows?: number;
}

export function StaffTableSkeleton({
  rows = 10,
}: Readonly<StaffTableSkeletonProps>) {
  const columns = [
    {
      header: "name",
      cellSkeleton: <Skeleton className="h-4 w-[120px]" />,
    },
    {
      header: "username",
      cellSkeleton: <Skeleton className="h-4 w-[100px]" />,
    },
    {
      header: "role",
      cellSkeleton: <Skeleton className="h-5 w-[80px] rounded-full" />,
    },
    {
      header: "status",
      cellSkeleton: (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ),
    },
    {
      header: "actions",
      cellSkeleton: <Skeleton className="h-8 w-[60px] ml-auto" />,
      className: "text-right",
    },
  ];

  return <GenericTableSkeleton rows={rows} columns={columns} />;
}
