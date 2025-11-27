"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { getMonthName } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

type TableChartProps = {
  labelType: "month" | "product";
  data: {
    label: string;
    image?: string;
    value: number;
    id?: string;
  }[];
};

interface ProgressBarProps {
  value: number; // Accepts a number between 0 and 100
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const boundedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="relative w-full h-3 bg-muted border border-border rounded-lg overflow-hidden">
      <div
        className="h-full rounded-lg transition-all duration-300"
        style={{ width: `${boundedValue}%`, backgroundColor: "orange" }}
      />
    </div>
  );
};

export default function TableChart({
  labelType = "month",
  data = [],
}: TableChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((item) => item.value));

  const dataWithPercentage = data.map((x) => ({
    ...x,
    label: labelType === "month" ? getMonthName(x.label) : x.label,
    percentage: Math.round((x.value / max) * 100),
  }));

  return (
    <div className="space-y-3">
      {dataWithPercentage.map(({ label, id, value, image, percentage }) => (
        <div
          key={label}
          className="grid grid-cols-[100px_1fr_80px] md:grid-cols-[250px_1fr_80px] gap-2 items-center"
        >
          {/* Label / Image */}
          {image && id ? (
            <Link
              className="flex items-center gap-2"
              href={`/admin/products/${id}`}
            >
              <Image
                className="rounded border aspect-square object-cover w-9 h-9"
                src={image}
                alt={label}
                width={36}
                height={36}
              />
              <span className="text-sm truncate">{label}</span>
            </Link>
          ) : (
            <span className="text-sm truncate">{label}</span>
          )}

          {/* Progress bar */}
          <ProgressBar value={percentage} />

          {/* Value */}
          <div className="text-sm text-right">
            <ProductPrice price={value} plain />
          </div>
        </div>
      ))}
    </div>
  );
}
