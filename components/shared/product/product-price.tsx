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

  const discountPercent = Math.round(100 - (price / listPrice) * 100);

  // Format only the main price with commas
  const formattedPrice = new Intl.NumberFormat().format(price);

  const stringValue = formattedPrice.toString();
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".")
    : [stringValue, ""];

  // If plain == true → return fully formatted currency only
  if (plain) {
    return (
      <span>
        {new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency.code,
          currencyDisplay: "narrowSymbol",
        }).format(price)}
      </span>
    );
  }

  // No discount, listPrice = 0
  if (listPrice == 0) {
    return (
      <div className={cn("text-2xl sm:text-3xl", className)}>
        <span className="text-xs align-super">KES</span>
        {intValue}
        <span className="text-xs align-super">{floatValue}</span>
      </div>
    );
  }

  // Deal section
  if (isDeal) {
    return (
      <div className="space-y-2">
        <div className="flex justify-center items-center gap-2">
          <span className="bg-red-700 rounded-sm p-1 text-white text-sm font-semibold">
           {discountPercent}% OFF
          </span>
          <span className="text-red-700 text-xs font-bold">
            Limited time deal
          </span>
        </div>

        <div
          className={`flex ${
            forListing ? "justify-center items-center" : "justify-start"
          } items-center gap-2 flex-wrap`}
        >
          <div className={cn("text-2xl sm:text-3xl break-words", className)}>
            <span className="text-xs align-super items-center text-center">KES</span>
            {intValue}
            <span className="text-xs align-super">{floatValue}</span>
          </div>

          <div className="text-muted-foreground text-xs whitespace-nowrap">
            Was: KES.{" "}
            <span className="line-through">{listPrice}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: showing discount + list price
  return (
    <div className="">
      <div className="flex justify-center gap-2 flex-wrap items-center">
        {/*<div className="text-2xl sm:text-3xl text-orange-700 whitespace-nowrap">
          -{discountPercent}%
        </div>*/}
        <div className={cn("text-2xl sm:text-3xl break-words", className)}>
          <span className="text-xs align-super">KES</span>
          {intValue}
          <span className="text-xs align-super">{floatValue}</span>
        </div>
      </div>

      {/*<div className="text-muted-foreground text-xs py-2 whitespace-nowrap">
        List price:{" "}
        <span className="line-through">
          KES {listPrice}
        </span>
      </div>*/}
    </div>
  );
};

export default ProductPrice;
