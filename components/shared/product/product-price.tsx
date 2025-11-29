"use client";
import useSettingStore from "@/hooks/use-setting-store";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

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
  const t = useTranslations();

  const format = useFormatter();
  const discountPercent = Math.round(100 - (price / listPrice) * 100);

  // Format only the main price with commas
  const formattedPrice = new Intl.NumberFormat().format(price);

  const stringValue = formattedPrice.toString();
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".")
    : [stringValue, ""];

  return plain ? (
    format.number(price, {
      style: "currency",
      currency: currency.code,
      currencyDisplay: "narrowSymbol",
    })
  ) : listPrice == 0 ? (
    <div className={cn("text-2xl sm:text-3xl", className)}>
      <span className="text-xs align-super">{currency.symbol}</span>
      {intValue}
      <span className="text-xs align-super">{floatValue}</span>
    </div>
  ) : isDeal ? (
    <div className="space-y-2">
      <div className="flex justify-center items-center gap-2">
        <span className="bg-red-700 rounded-sm p-1 text-white text-sm font-semibold">
          {discountPercent}% {t("Product.Off")}
        </span>
        <span className="text-red-700 text-xs font-bold">
          {t("Product.Limited time deal")}
        </span>
      </div>
      <div
        className={`flex ${forListing ? "justify-center" : "justify-start"} items-center gap-2 flex-wrap`}
      >
        <div className={cn("text-2xl sm:text-3xl break-words", className)}>
          <span className="text-xs align-super">{currency.symbol}</span>
          {intValue}
          <span className="text-xs align-super">{floatValue}</span>
        </div>
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {t("Product.Was")}: KES.
          <span className="line-through">{listPrice}</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="">
      <div className="flex justify-center gap-2 flex-wrap items-center">
        <div className="text-2xl sm:text-3xl text-orange-700 whitespace-nowrap">
          -{discountPercent}%
        </div>
        <div className={cn("text-2xl sm:text-3xl break-words", className)}>
          <span className="text-xs align-super">{currency.symbol}</span>
          {intValue}
          <span className="text-xs align-super">{floatValue}</span>
        </div>
      </div>
      <div className="text-muted-foreground text-xs py-2 whitespace-nowrap">
        {t("Product.List price")}:{" "}
        <span className="line-through">KES {listPrice}</span>
      </div>
    </div>
  );
};

export default ProductPrice;
