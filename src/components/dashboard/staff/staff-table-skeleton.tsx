import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n";

interface StaffTableSkeletonProps {
  rows?: number;
  userIsManager?: boolean;
}

export function StaffTableSkeleton({ 
  rows = 10, 
  userIsManager = true 
}: StaffTableSkeletonProps) {
  const t = useTranslation();
  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("username")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("total_sales_value")}</TableHead>
              <TableHead>{t("number_of_sales")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              {userIsManager && (
                <TableHead className="text-right">{t("actions")}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[40px]" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                </TableCell>
                {userIsManager && (
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-[60px] ml-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 