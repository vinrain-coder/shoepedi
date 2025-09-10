"use client";

import React from "react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

interface SalesCategoryPieChartProps {
  data: { _id: string; totalSales: number }[];
}

export default function SalesCategoryPieChart({
  data,
}: SalesCategoryPieChartProps) {
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

    // Skip label if it would overflow too far
    if (!data[index]) return null;

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${data[index]._id} ${data[index].totalSales}`}
      </text>
    );
  };

  // Primary color from CSS variable
  const primaryColor =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--primary")
      : "#3b82f6";

  const colors = data.map((_, i) => primaryColor);

  return (
    <div className="w-full h-80 sm:h-96 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalSales"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
