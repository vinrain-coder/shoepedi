"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function UserOrderHistoryChart({
  data,
}: {
  data: Array<{ month: string; orders: number }>;
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart accessibilityLayer data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const [year, month] = String(value).split("-");
            const date = new Date(Number(year), Number(month) - 1, 1);
            return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const [year, month] = String(value).split("-");
                const date = new Date(Number(year), Number(month) - 1, 1);
                return date.toLocaleString("en-US", { month: "long", year: "numeric" });
              }}
            />
          }
        />
        <Area
          dataKey="orders"
          type="monotone"
          fill="var(--color-orders)"
          fillOpacity={0.2}
          stroke="var(--color-orders)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
