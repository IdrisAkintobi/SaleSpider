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

interface PerformanceChartProps {
  data: Array<{ name: string; sales: number; target?: number }>; // Name could be day, week, month, cashier
  title: string;
  description?: string;
  xAxisDataKey?: string;
  barDataKey?: string;
  className?: string;
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
  className,
}: PerformanceChartProps) {
  const hasTarget = data.some((item) => item.target !== undefined);

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
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
            {hasTarget && <Legend />}
            <Bar dataKey={barDataKey} fill="var(--color-sales)" radius={4} />
            {hasTarget && (
              <Bar dataKey="target" fill="var(--color-target)" radius={4} />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
