"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

interface SalesCategoryPieChartProps {
  data: { _id: string; totalSales: number }[];
}

export default function SalesCategoryPieChart({
  data,
}: SalesCategoryPieChartProps) {
  const RADIAN = Math.PI / 180;
  const [primaryColor, setPrimaryColor] = useState("#3b82f6"); // default Tailwind blue

  // Get CSS variable on client
  useEffect(() => {
    const color =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--primary"
      ) || "#3b82f6";
    setPrimaryColor(color.trim());
  }, []);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: any) => {
    if (!data[index]) return null;

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
        {`${data[index]._id} ${data[index].totalSales}`}
      </text>
    );
  };

  // Use same color for all slices
  const colors = data.map(() => primaryColor);

  return (
    <div className="w-full h-80 sm:h-96 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            dataKey="totalSales"
            cx="50%"
            cy="50%"
            outerRadius="90%"
            innerRadius={0} // adjust if you want a donut
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
