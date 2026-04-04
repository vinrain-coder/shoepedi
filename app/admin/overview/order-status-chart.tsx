"use client";

import { ORDER_STATUS_LABELS } from "@/lib/order-tracking";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface OrderStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  "#94a3b8", // pending - slate
  "#0ea5e9", // confirmed - sky
  "#6366f1", // processing - indigo
  "#8b5cf6", // packed - violet
  "#06b6d4", // shipped - cyan
  "#f59e0b", // out_for_delivery - amber
  "#10b981", // delivered - emerald
  "#f43f5e", // cancelled - rose
  "#71717a", // returned - zinc
  "#ef4444", // delivery_exception - red
];

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    label: ORDER_STATUS_LABELS[item.name as keyof typeof ORDER_STATUS_LABELS] || item.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="label"
          type="category"
          tick={{ fontSize: 12 }}
          width={100}
          stroke="var(--foreground)"
        />
        <Tooltip
          cursor={{ fill: "var(--primary)", opacity: 0.1 }}
          contentStyle={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
