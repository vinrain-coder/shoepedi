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
  price: number;
  listPrice?: number;
  className?: string;
  plain?: boolean;
  isDeal?: boolean;
}) => {
  const { getCurrency } = useSettingStore();
  const currency = getCurrency();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const stringValue = price.toFixed(2).toString();
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".")
    : [stringValue, ""];

  if (plain) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      currencyDisplay: "narrowSymbol",
    }).format(price);
  }

  // ✅ Deal styling
  if (isDeal && listPrice > price) {
    const discount = Math.round(((listPrice - price) / listPrice) * 100);

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
            <span className="text-xs align-super">{currency.symbol}</span>
            {formatPrice(price)}
            <span className="text-xs align-super">{floatValue}</span>
          </div>

          {/* List Price (strikethrough) */}
          <div className="text-muted-foreground line-through text-md">
            {currency.symbol} {formatPrice(listPrice)}
          </div>

          {/* Discount badge */}
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
            {discount}% OFF
          </span>
          {/* Limited deal text */}
          <div className="flex items-center gap-1 text-red-600 font-semibold text-sm uppercase tracking-wide">
            <Flame size={12} className="text-red-600 animate-pulse mr-2" />
            Hot Deal
          </div>
        </div>
      </div>
    );
  }

  // ✅ Normal pricing
  return listPrice === 0 ? (
    <div className={cn("text-2xl sm:text-3xl", className)}>
      <span className="text-xs align-super">{currency.symbol}</span>
      {formatPrice(price)}
      <span className="text-xs align-super">{floatValue}</span>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <div className={cn("text-2xl sm:text-3xl font-semibold", className)}>
        <span className="text-xs align-super">{currency.symbol}</span>
        {formatPrice(price)}
        <span className="text-xs align-super">{floatValue}</span>
      </div>
      <div className="text-muted-foreground line-through text-md">
        {currency.symbol} {formatPrice(listPrice)}
      </div>
    </div>
  );
};

export default ProductPrice;
