import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  CashierSelect,
  DateRangeQuickSelect,
  PaymentMethodSelect,
} from "./filters";

interface SalesFiltersProps {
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly filterPaymentMethod: string;
  readonly onPaymentMethodChange: (value: string) => void;
  readonly filterCashier: string;
  readonly onCashierChange: (value: string) => void;
  readonly filterDateRange: string;
  readonly onDateRangeChange: (value: string) => void;
  readonly dateRange: DateRange | undefined;
  readonly onDateRangeSelect: (range: DateRange | undefined) => void;
  readonly isDatePickerOpen: boolean;
  readonly onDatePickerOpenChange: (open: boolean) => void;
  readonly onClearDateRange: () => void;
  readonly userIsManager: boolean;
  readonly userIsCashier: boolean;
  readonly enabledPaymentOptions: ReadonlyArray<{
    readonly label: string;
    readonly enum: string;
  }>;
  readonly uniqueCashiers: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
  readonly t: (key: string) => string;
}

export function SalesFilters({
  searchTerm,
  onSearchChange,
  filterPaymentMethod,
  onPaymentMethodChange,
  filterCashier,
  onCashierChange,
  filterDateRange,
  onDateRangeChange,
  dateRange,
  onDateRangeSelect,
  isDatePickerOpen,
  onDatePickerOpenChange,
  onClearDateRange,
  userIsManager,
  userIsCashier,
  enabledPaymentOptions,
  uniqueCashiers,
  t,
}: SalesFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 overflow-x-auto">
      <Input
        placeholder={
          userIsCashier ? t("search_sales_product") : t("search_sales_cashier")
        }
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full lg:w-[200px] flex-shrink-0"
        icon={<Filter className="h-4 w-4 text-muted-foreground" />}
      />
      <PaymentMethodSelect
        value={filterPaymentMethod}
        onChange={onPaymentMethodChange}
        options={enabledPaymentOptions}
        t={t}
      />
      <CashierSelect
        show={userIsManager}
        value={filterCashier}
        onChange={onCashierChange}
        cashiers={uniqueCashiers}
        t={t}
      />
      <DateRangeQuickSelect
        value={filterDateRange}
        onChange={onDateRangeChange}
        t={t}
        isCashier={userIsCashier}
      />
      <Popover open={isDatePickerOpen} onOpenChange={onDatePickerOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full lg:w-[220px] justify-start text-left font-normal overflow-hidden flex-shrink-0",
              !dateRange ||
                (!dateRange.from && !dateRange.to && "text-muted-foreground")
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {dateRange?.from && dateRange?.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                t("pick_date_range")
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeSelect}
            numberOfMonths={1}
            disabled={date => {
              const today = new Date();
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);

              if (userIsCashier) {
                return date > today || date < sevenDaysAgo;
              }

              return date > today || date < new Date("1900-01-01");
            }}
          />
        </PopoverContent>
      </Popover>
      {dateRange && (
        <Button variant="outline" size="sm" onClick={onClearDateRange}>
          {t("clear_range")}
        </Button>
      )}
    </div>
  );
}
