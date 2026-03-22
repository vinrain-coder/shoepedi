"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/lib/db/models/product.model";

type SelectVariantProps = {
  product: IProduct;
  color?: string;
  size?: string;
  syncUrl?: boolean;
  onVariantChange?: (variant: { color?: string; size?: string }) => void;
};

export default function SelectVariant({
  product,
  color,
  size,
  syncUrl = true,
  onVariantChange,
}: SelectVariantProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultColor = color || product.colors?.[0];
  const defaultSize = size || product.sizes?.[0];

  const [selectedColor, setSelectedColor] = useState<string | undefined>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(defaultSize);

  useEffect(() => {
    setSelectedColor(defaultColor);
    setSelectedSize(defaultSize);
  }, [defaultColor, defaultSize]);

  const updateVariant = (newColor?: string, newSize?: string) => {
    setSelectedColor(newColor);
    setSelectedSize(newSize);
    onVariantChange?.({ color: newColor, size: newSize });

    if (!syncUrl || !pathname) return;

    const params = new URLSearchParams(searchParams.toString());

    if (newColor) {
      params.set("color", newColor);
    } else {
      params.delete("color");
    }

    if (newSize) {
      params.set("size", newSize);
    } else {
      params.delete("size");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <>
      {product.colors.length > 0 && (
        <div className="space-x-2 space-y-2">
          <div>Color:</div>
          {product.colors.map((variantColor) => (
            <Button
              key={variantColor}
              type="button"
              variant="outline"
              className={
                selectedColor === variantColor
                  ? "border-2 border-primary dark:border-primary"
                  : "border-2"
              }
              onClick={() => updateVariant(variantColor, selectedSize)}
            >
              <div
                style={{ backgroundColor: variantColor }}
                className="h-4 w-4 rounded-full border border-muted-foreground"
              />
              {variantColor}
            </Button>
          ))}
        </div>
      )}
      {product.sizes.length > 0 && (
        <div className="mt-2 space-x-2 space-y-2">
          <div>Size:</div>
          {product.sizes.map((variantSize) => (
            <Button
              key={variantSize}
              type="button"
              variant="outline"
              className={
                selectedSize === variantSize
                  ? "border-2 border-primary dark:border-primary"
                  : "border-2"
              }
              onClick={() => updateVariant(selectedColor, variantSize)}
            >
              {variantSize}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
