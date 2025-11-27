/**
 * CSV Export utility functions
 */

import { fetchJson } from "@/lib/fetch-utils";

export interface CSVColumn {
  readonly key: string;
  readonly label: string;
  readonly formatter?: (value: any, row?: any) => string;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], columns: CSVColumn[]): string {
  if (!data.length) return "";

  // Create header row
  const headers = columns.map(col => `"${col.label}"`).join(",");

  // Create data rows
  const rows = data.map(row => {
    return columns
      .map(col => {
        const value = row[col.key];
        const formattedValue = col.formatter
          ? col.formatter(value, row)
          : value;

        // Escape quotes and wrap in quotes
        const escapedValue = String(formattedValue || "").replaceAll('"', '""');
        return `"${escapedValue}"`;
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

/**
 * Format date for CSV export
 */
export function formatDateForCSV(timestamp: string | number): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } catch {
    return "Invalid Date";
  }
}

/**
 * Format currency for CSV export (remove currency symbols)
 */
export function formatCurrencyForCSV(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogsCSV(filters?: any): Promise<void> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.entityType) params.append("entityType", filters.entityType);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.userEmail) params.append("userEmail", filters.userEmail);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    params.append("limit", "10000"); // Large limit for export

    const data = await fetchJson<any>(`/api/audit-logs?${params.toString()}`);
    const auditLogs = data.auditLogs || [];

    const columns: CSVColumn[] = [
      { key: "timestamp", label: "Date", formatter: formatDateForCSV },
      { key: "entityType", label: "Entity Type" },
      { key: "action", label: "Action" },
      { key: "entityId", label: "Entity ID" },
      {
        key: "userEmail",
        label: "User Email",
        formatter: value => value || "System",
      },
      {
        key: "changes",
        label: "Changes",
        formatter: value => (value ? JSON.stringify(value) : ""),
      },
      {
        key: "oldValues",
        label: "Old Values",
        formatter: value => (value ? JSON.stringify(value) : ""),
      },
      {
        key: "newValues",
        label: "New Values",
        formatter: value => (value ? JSON.stringify(value) : ""),
      },
      {
        key: "metadata",
        label: "Metadata",
        formatter: value => (value ? JSON.stringify(value) : ""),
      },
    ];

    const csvContent = convertToCSV(auditLogs, columns);
    const filename = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;

    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    throw error;
  }
}

/**
 * Export sales to CSV
 */
export async function exportSalesCSV(filters?: any): Promise<void> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
    if (filters?.cashierId && filters.cashierId !== "all")
      params.append("cashierId", filters.cashierId);
    if (filters?.paymentMethod && filters.paymentMethod !== "all")
      params.append("paymentMethod", filters.paymentMethod);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    params.append("limit", "10000"); // Large limit for export

    const data = await fetchJson<any>(`/api/sales?${params.toString()}`);
    const sales = data.data || [];

    const columns: CSVColumn[] = [
      {
        key: "timestamp",
        label: "Date",
        formatter: value =>
          new Date(value).toLocaleDateString() +
          " " +
          new Date(value).toLocaleTimeString(),
      },
      { key: "id", label: "Sale ID" },
      { key: "cashierName", label: "Cashier" },
      {
        key: "itemsCount",
        label: "Items Count",
        formatter: (_, row) => String(row.items?.length || 0),
      },
      {
        key: "totalAmount",
        label: "Total Amount",
        formatter: formatCurrencyForCSV,
      },
      { key: "paymentMode", label: "Payment Method" },
      {
        key: "items",
        label: "Items Details",
        formatter: items =>
          items
            ?.map(
              (item: any) =>
                `${item.productName} (${item.quantity}x ${item.price})`
            )
            .join("; ") || "",
      },
    ];

    const csvContent = convertToCSV(sales, columns);
    const filename = `sales-${new Date().toISOString().split("T")[0]}.csv`;

    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error("Error exporting sales:", error);
    throw error;
  }
}
