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
  key: keyof T | string;
  label: React.ReactNode;
  sortable?: boolean;
  onSort?: () => void;
  align?: "left" | "right" | "center";
  className?: string;
}

export interface GenericTableProps<T> {
  columns: GenericTableColumn<T>[];
  data: T[];
  renderCell?: (row: T, col: GenericTableColumn<T>, rowIndex: number) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  paginationProps?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  rowKey?: (row: T, index: number) => React.Key;
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
          {columns.map((col, idx) => (
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
              {columns.map((col, colIndex) => (
                <TableCell
                  key={col.key as string}
                  className={col.className}
                  style={{ textAlign: col.align }}
                >
                  {renderCell
                    ? renderCell(row, col, rowIndex)
                    : (row as any)[col.key]}
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