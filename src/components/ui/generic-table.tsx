import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableFooter,
} from "./table";
import { TablePagination } from "./table-pagination";

export interface GenericTableColumn<T> {
  readonly key: keyof T | string;
  readonly label: React.ReactNode;
  readonly sortable?: boolean;
  readonly onSort?: () => void;
  readonly align?: "left" | "right" | "center";
  readonly className?: string;
}

export interface GenericTableProps<T> {
  readonly columns: GenericTableColumn<T>[];
  readonly data: T[];
  readonly renderCell?: (row: T, col: GenericTableColumn<T>, rowIndex: number) => React.ReactNode;
  readonly emptyMessage?: React.ReactNode;
  readonly paginationProps?: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly onPageChange: (page: number) => void;
    readonly onPageSizeChange: (size: number) => void;
  };
  readonly rowKey?: (row: T, index: number) => React.Key;
}

export function GenericTable<T extends object>({
  columns,
  data,
  renderCell,
  emptyMessage = "No data found.",
  paginationProps,
  rowKey,
}: GenericTableProps<T>) {
  const colSpan = columns.length;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, _) => (
            <TableHead
              key={col.key as string}
              className={col.className}
              style={{ textAlign: col.align }}
              onClick={col.sortable && col.onSort ? col.onSort : undefined}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <TableRow key={rowKey ? rowKey(row, rowIndex) : rowIndex}>
              {columns.map((col, _) => (
                <TableCell
                  key={col.key as string}
                  className={col.className}
                  style={{ textAlign: col.align }}
                >
                  {renderCell
                    ? renderCell(row, col, rowIndex)
                    : (row as unknown as Record<string, unknown>)[col.key as string] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={colSpan} className="h-24 text-center">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      {paginationProps && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={colSpan} className="p-0">
              <TablePagination {...paginationProps} />
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
} 