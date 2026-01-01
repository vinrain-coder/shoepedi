"use client";

import useSettingStore from "@/hooks/use-setting-store";
import { cn } from "@/lib/utils";

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
}: {
  price: number;
  isDeal?: boolean;
  listPrice?: number;
  className?: string;
  forListing?: boolean;
  plain?: boolean;
}) => {
  const { getCurrency } = useSettingStore();
  const currency = getCurrency();

  // Helper to format numbers with commas
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const discountPercent = Math.round(100 - (price / listPrice) * 100);
  const formattedPrice = formatNumber(price);
  const formattedListPrice = formatNumber(listPrice);

  const [intValue, floatValue] = formattedPrice.includes(".")
    ? formattedPrice.split(".")
    : [formattedPrice, ""];

  // Plain text return (e.g. for meta tags or simple labels)
  if (plain) {
    return `${currency.symbol}${formattedPrice}`;
  }

  // Case 1: No list price (Simple Price)
  if (listPrice === 0) {
    return (
      <div className={cn("flex items-baseline font-bold tracking-tight", className)}>
        <span className="text-sm mr-0.5 self-start mt-1">{currency.symbol}</span>
        <span className="text-2xl sm:text-3xl">{intValue}</span>
        {floatValue && <span className="text-sm self-start mt-1">{floatValue}</span>}
      </div>
    );
  }

  // Case 2: Limited Time Deal Layout
  if (isDeal) {
    return (
      <div className={cn("flex flex-col gap-1", forListing ? "items-center" : "items-start")}>
        <div className="flex items-center gap-2">
          <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-white font-bold">
            {discountPercent}% Off
          </span>
          <span className="text-red-600 text-[11px] font-bold uppercase tracking-tight">
            Limited time deal
          </span>
        </div>
        
        <div className="flex items-baseline gap-2 flex-wrap">
          <div className={cn("flex items-baseline font-bold text-red-600", className)}>
            <span className="text-sm mr-0.5 self-start mt-1">{currency.symbol}</span>
            <span className="text-2xl sm:text-3xl">{intValue}</span>
            {floatValue && <span className="text-sm self-start mt-1">{floatValue}</span>}
          </div>
          <div className="text-muted-foreground text-xs line-through decoration-1">
            Was: {currency.symbol}{formattedListPrice}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Standard Discount Layout
  return (
    <div className={cn("flex flex-col", forListing ? "items-center" : "items-start")}>
      <div className="flex items-center gap-3">
        <div className="text-2xl sm:text-3xl font-light text-orange-600">
          -{discountPercent}%
        </div>
        <div className={cn("flex items-baseline font-bold tracking-tight", className)}>
          <span className="text-sm mr-0.5 self-start mt-1">{currency.symbol}</span>
          <span className="text-2xl sm:text-3xl">{intValue}</span>
          {floatValue && <span className="text-sm self-start mt-1">{floatValue}</span>}
        </div>
      </div>
      <div className="text-muted-foreground text-[11px] mt-1 italic">
        List Price: <span className="line-through">{currency.symbol}{formattedListPrice}</span>
      </div>
    </div>
  );
};

export default ProductPrice;
