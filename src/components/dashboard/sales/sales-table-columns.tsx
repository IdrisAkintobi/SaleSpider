import { ArrowDown, ArrowUp } from "lucide-react";

// Helper to create sortable column header
function createSortableHeader(
  key: string,
  label: string,
  currentSort: string,
  order: "asc" | "desc",
  onSort: (key: string) => void
) {
  return (
    <button
      type="button"
      className="cursor-pointer hover:underline focus:outline-none focus:underline"
      onClick={() => onSort(key)}
    >
      {label}{" "}
      {currentSort === key &&
        (order === "asc" ? (
          <ArrowUp className="inline w-3 h-3" />
        ) : (
          <ArrowDown className="inline w-3 h-3" />
        ))}
    </button>
  );
}

export function createSalesTableColumns(
  t: (key: string) => string,
  sort: string,
  order: "asc" | "desc",
  handleSort: (key: string) => void
) {
  return [
    {
      key: "createdAt",
      label: createSortableHeader(
        "createdAt",
        t("date"),
        sort,
        order,
        handleSort
      ),
      sortable: true,
      onSort: () => handleSort("createdAt"),
    },
    {
      key: "cashierName",
      label: createSortableHeader(
        "cashierName",
        t("cashier"),
        sort,
        order,
        handleSort
      ),
      sortable: true,
      onSort: () => handleSort("cashierName"),
    },
    { key: "itemsCount", label: t("items_count") },
    {
      key: "totalAmount",
      label: createSortableHeader(
        "totalAmount",
        t("total_amount"),
        sort,
        order,
        handleSort
      ),
      sortable: true,
      onSort: () => handleSort("totalAmount"),
    },
    {
      key: "paymentMode",
      label: createSortableHeader(
        "paymentMode",
        t("payment_mode"),
        sort,
        order,
        handleSort
      ),
      sortable: true,
      onSort: () => handleSort("paymentMode"),
    },
    {
      key: "actions",
      label: <span className="text-right">{t("actions")}</span>,
      align: "right" as const,
    },
  ];
}
