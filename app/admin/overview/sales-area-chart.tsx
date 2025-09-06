/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="p-2">
          <p>{label && formatDateTime(new Date(label)).dateOnly}</p>
          <p className="text-primary text-xl">
            <ProductPrice price={payload[0].value} plain />
          </p>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const CustomXAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <text x={x} y={y + 10} textAnchor="left" fill="#666" className="text-xs">
      {formatDateTime(new Date(payload.value)).dateOnly}
      {/* {`${payload.value.split('/')[1]}/${payload.value.split('/')[2]}`} */}
    </text>
  );
};

export default function SalesAreaChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <CartesianGrid horizontal={true} vertical={false} stroke="" />
        <XAxis dataKey="date" tick={<CustomXAxisTick />} interval={3} />
        <YAxis fontSize={12} tickFormatter={(value: number) => `$${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalSales"
          stroke={[]}
          strokeWidth={2}
          fill={`hsl(${["--primary"]})`}
          fillOpacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
