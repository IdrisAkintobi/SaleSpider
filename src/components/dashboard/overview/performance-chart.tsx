"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencySettings } from "@/lib/currency";

interface PerformanceChartProps {
  readonly data: Array<{ name: string } & Record<string, number | string>>;
  readonly title: string;
  readonly description?: string;
  readonly xAxisDataKey?: string;
  readonly barDataKey?: string;
  readonly extraBarDataKey?: string;
  readonly barLabels?: Readonly<Record<string, string>>;
  readonly className?: string;
  readonly comparisonType?: string;
  readonly onComparisonTypeChange?: (type: string) => void;
  readonly comparisonOptions?: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--chart-2))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;

export function PerformanceChart({
  data,
  title,
  description,
  xAxisDataKey = "name",
  barDataKey = "sales",
  extraBarDataKey,
  barLabels,
  className,
  comparisonType,
  onComparisonTypeChange,
  comparisonOptions,
}: PerformanceChartProps) {
  const hasExtraBar = !!extraBarDataKey;
  const { currency, currencySymbol } = useCurrencySettings();
  // List of all dollar currencies
  const dollarCurrencies = ["USD", "CAD", "AUD", "NZD", "SGD", "HKD", "BMD", "BZD", "FJD", "GYD", "JMD", "LRD", "NAD", "SBD", "SRD", "TTD", "TWD", "ZWD"];
  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        </div>
        {comparisonType && onComparisonTypeChange && comparisonOptions && (
          <Select value={comparisonType} onValueChange={onComparisonTypeChange}>
            <SelectTrigger className="w-[180px] ml-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {comparisonOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 py-6">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: 45, bottom: 5 }}
            >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xAxisDataKey}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={40}
              tickFormatter={(value) => {
                // Format large numbers with K/M suffix
                if (value >= 1000000) {
                  return `${dollarCurrencies.includes(currency) ? '$' : currencySymbol}${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${dollarCurrencies.includes(currency) ? '$' : currencySymbol}${(value / 1000).toFixed(1)}K`;
                } else {
                  return `${dollarCurrencies.includes(currency) ? '$' : currencySymbol}${value}`;
                }
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar
              dataKey={barDataKey}
              fill="var(--color-sales)"
              radius={4}
              name={barLabels?.[barDataKey] ?? barDataKey}
            />
            {hasExtraBar && (
              <Bar
                dataKey={extraBarDataKey}
                fill="var(--color-target)"
                radius={4}
                name={extraBarDataKey ? (barLabels?.[extraBarDataKey] ?? extraBarDataKey) : undefined}
              />
            )}
          </BarChart>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
