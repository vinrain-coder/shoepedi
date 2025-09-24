"use client";

import { useTheme } from "next-themes";
import React from "react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

export default function SalesCategoryPieChart({ data }: { data: any[] }) {
  const { theme } = useTheme();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${data[index]._id} ${data[index].totalSales} sales`}
      </text>
    );
  };

  // ShadCN primary colors from Tailwind
  const primaryColors = [
    "var(--shadcn-primary-50)",
    "var(--shadcn-primary-100)",
    "var(--shadcn-primary-200)",
    "var(--shadcn-primary-300)",
    "var(--shadcn-primary-400)",
    "var(--shadcn-primary-500)",
    "var(--shadcn-primary-600)",
    "var(--shadcn-primary-700)",
    "var(--shadcn-primary-800)",
    "var(--shadcn-primary-900)",
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="totalSales"
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={primaryColors[index % primaryColors.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
