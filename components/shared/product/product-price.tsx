/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import useSettingStore from "@/hooks/use-setting-store";
import { cn } from "@/lib/utils";

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  plain = false,
}: {
  price: number;
  listPrice?: number;
  className?: string;
  plain?: boolean;
}) => {
  const { getCurrency } = useSettingStore();
  const currency = getCurrency();

  // Format with commas
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const stringValue = price.toFixed(2).toString();
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".")
    : [stringValue, ""];

  return plain ? (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      currencyDisplay: "narrowSymbol",
    }).format(price)
  ) : listPrice === 0 ? (
    <div className={cn("text-2xl sm:text-3xl", className)}>
      <span className="text-xs align-super">{currency.symbol}</span>
      {formatPrice(price)}
      <span className="text-xs align-super">{floatValue}</span>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Discounted Price */}
      <div className={cn("text-2xl sm:text-3xl font-semibold", className)}>
        <span className="text-xs align-super">{currency.symbol}</span>
        {formatPrice(price)}
        <span className="text-xs align-super">{floatValue}</span>
      </div>

      {/* List Price (strikethrough) */}
      <div className="text-muted-foreground line-through text-xl">
        {currency.symbol} {formatPrice(listPrice)}
      </div>
    </div>
  );
};

export default ProductPrice;
