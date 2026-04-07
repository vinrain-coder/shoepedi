"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

interface UserOrderTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

function UserOrderTooltip({ active, payload, label }: UserOrderTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;
  return (
    <Card>
      <CardContent className="p-2">
        <p className="text-xs text-muted-foreground">{label ? formatDateTime(new Date(label)).dateOnly : "-"}</p>
        <p className="text-lg font-semibold text-primary">{value} orders</p>
      </CardContent>
    </Card>
  );
}

export default function UserOrderHistoryChart({
  data,
}: {
  data: Array<{ month: string; orders: number }>;
}) {
  const chartData = data.map((item) => ({
    date: `${item.month}-01T00:00:00.000Z`,
    orders: item.orders,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData}>
        <CartesianGrid horizontal vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={20}
          tickFormatter={(value: string) => formatDateTime(new Date(value)).dateOnly}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
        <Tooltip content={<UserOrderTooltip />} />
        <Area
          type="monotone"
          dataKey="orders"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="var(--primary)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
