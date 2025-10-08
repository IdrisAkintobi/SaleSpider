import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TFunc = (key: string) => string;

export type PaymentOption = { enum: string; label: string };
export type Cashier = { id: string; name: string };

export function PaymentMethodSelect({
  value,
  onChange,
  options,
  t,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  options: readonly PaymentOption[];
  t: TFunc;
}>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[240px]">
        <SelectValue placeholder={t("filter_by_payment_method")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("all_payment_methods")}</SelectItem>
        {options.map((m) => (
          <SelectItem key={m.enum} value={m.enum}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CashierSelect({
  show,
  value,
  onChange,
  cashiers,
  t,
}: Readonly<{
  show: boolean;
  value: string;
  onChange: (v: string) => void;
  cashiers: readonly Cashier[];
  t: TFunc;
}>) {
  if (!show) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[220px]">
        <SelectValue placeholder={t("filter_by_cashier")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("all_cashiers")}</SelectItem>
        {cashiers.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DateRangeQuickSelect({
  value,
  onChange,
  t,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  t: TFunc;
}>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder={t("filter_by_date")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("all_time")}</SelectItem>
        <SelectItem value="today">{t("today")}</SelectItem>
        <SelectItem value="week">{t("this_week")}</SelectItem>
        <SelectItem value="month">{t("this_month")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
