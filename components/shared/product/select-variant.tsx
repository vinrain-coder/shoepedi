"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/lib/db/models/product.model";

export default function SelectVariant({
  product,
  color,
  size,
}: {
  product: IProduct;
  color?: string;
  size?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedColor, setSelectedColor] = useState(
    color || product.colors[0]
  );
  const [selectedSize, setSelectedSize] = useState(size || product.sizes[0]);

  useEffect(() => {
    setSelectedColor(color || product.colors[0]);
    setSelectedSize(size || product.sizes[0]);
  }, [color, size, product.colors, product.sizes]);

  const updateVariant = (newColor: string, newSize: string) => {
    setSelectedColor(newColor);
    setSelectedSize(newSize);

    const params = new URLSearchParams(searchParams.toString());
    params.set("color", newColor);
    params.set("size", newSize);

    // Use router.replace with scroll: false to prevent jumping
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {product.colors.length > 0 && (
        <div className="space-x-2 space-y-2">
          <div>Color:</div>
          {product.colors.map((x) => (
            <Button
              key={x}
              variant="outline"
              className={
                selectedColor === x
                  ? "border-2 border-primary dark:border-primary"
                  : "border-2"
              }
              onClick={() => updateVariant(x, selectedSize)}
            >
              <div
                style={{ backgroundColor: x }}
                className="h-4 w-4 rounded-full border border-muted-foreground"
              ></div>
              {x}
            </Button>
          ))}
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="mt-2 space-x-2 space-y-2">
          <div>Size:</div>
          {product.sizes.map((x) => (
            <Button
              key={x}
              variant="outline"
              className={
                selectedSize === x
                  ? "border-2 border-primary dark:border-primary"
                  : "border-2"
              }
              onClick={() => updateVariant(selectedColor, x)}
            >
              {x}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
