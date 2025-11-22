/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import useSettingStore from "@/hooks/use-setting-store";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  plain = false,
  isDeal = false,
}: {
  price: number | string | undefined | null;
  listPrice?: number | string;
  className?: string;
  plain?: boolean;
  isDeal?: boolean;
}) => {
  if (price == null) {
    return (
      <span className="text-xs text-red-500 font-medium">
        Price unavailable
      </span>
    );
  }

  // Convert to number safely
  const numericPrice =
    typeof price === "number" ? price : parseFloat(price.toString());

  const numericList =
    typeof listPrice === "number"
      ? listPrice
      : parseFloat(listPrice?.toString() || "0");

  // If still NaN, fallback to 0
  const safePrice = Number.isNaN(numericPrice) ? 0 : numericPrice;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const stringValue = safePrice.toFixed(2);
  const [intValue, floatValue] = stringValue.split(".");

  // Deal styling (use safe numbers)
  if (isDeal && numericList > safePrice) {
    const discount = Math.round(
      ((numericList - safePrice) / numericList) * 100
    );

    return (
      <div className="flex flex-col items-center gap-2">
        {/* Prices & discount */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Discounted Price */}
          <div
            className={cn(
              "text-2xl sm:text-3xl font-bold text-red-600",
              className
            )}
          >
            <span className="text-xs align-super">KES</span>
            {formatPrice(safePrice)}
            <span className="text-xs align-super">{floatValue}</span>
          </div>

          {/* List Price (strikethrough) */}
          <div className="text-muted-foreground line-through text-md">
            KES {formatPrice(numericList)}
          </div>

          {/* Discount badge */}
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
            {discount}% OFF
          </span>
          {/* Limited deal text */}
          <div className="flex items-center gap-1 text-red-600 font-semibold text-sm uppercase tracking-wide">
            <Flame className="text-red-600 animate-pulse mr-1 size-4" />
            Hot Deal
          </div>
        </div>
      </div>
    );
  }

  // ✅ Normal pricing
  return numericList === 0 ? (
    <div className={cn("text-2xl sm:text-3xl", className)}>
      <span className="text-xs align-super">KES</span>
      {formatPrice(safePrice)}
      <span className="text-xs align-super">{floatValue}</span>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <div className={cn("text-2xl sm:text-3xl font-semibold", className)}>
        <span className="text-xs align-super">KES</span>
        {formatPrice(safePrice)}
        <span className="text-xs align-super">{floatValue}</span>
      </div>
      <div className="text-muted-foreground line-through text-md">
        KES {formatPrice(numericList)}
      </div>
    </div>
  );
};

export default ProductPrice;
