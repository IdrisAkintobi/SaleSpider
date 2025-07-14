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

interface PerformanceChartProps {
  data: Array<{ name: string; [key: string]: any }>;
  title: string;
  description?: string;
  xAxisDataKey?: string;
  barDataKey?: string;
  extraBarDataKey?: string;
  barLabels?: { [key: string]: string };
  className?: string;
  comparisonType?: string;
  onComparisonTypeChange?: (type: string) => void;
  comparisonOptions?: { value: string; label: string }[];
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
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
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
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {(barLabels && (barDataKey || extraBarDataKey)) && <Legend payload={[
              ...(barDataKey ? [{ value: barLabels[barDataKey] || barDataKey, type: "rect", color: "var(--color-sales)" }] : []),
              ...(extraBarDataKey ? [{ value: barLabels[extraBarDataKey] || extraBarDataKey, type: "rect", color: "var(--color-target)" }] : []),
            ] as any} />}
            <Bar dataKey={barDataKey} fill="var(--color-sales)" radius={4} />
            {hasExtraBar && (
              <Bar dataKey={extraBarDataKey} fill="var(--color-target)" radius={4} />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
