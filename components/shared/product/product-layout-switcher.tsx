"use client";

import { Grid2X2, RectangleHorizontal } from "lucide-react";
import useProductLayoutStore from "@/hooks/use-product-layout-store";
import { IProduct } from "@/lib/db/models/product.model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductCard from "./product-card";

export default function ProductLayoutSwitcher({
  products = [],
}: {
  products?: IProduct[];
}) {
  const { layout, setLayout } = useProductLayoutStore();

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-4">
      {/* Layout Toggle */}
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-full border bg-muted/30 p-1 shadow-sm backdrop-blur">
          <Button
            type="button"
            size="sm"
            variant={layout === "classic" ? "default" : "ghost"}
            className={cn(
              "rounded-full px-3.5 text-xs sm:text-sm",
              layout !== "classic" && "text-muted-foreground",
            )}
            onClick={() => setLayout("classic")}
          >
            <Grid2X2 className="size-4" />
            Classic
          </Button>

          <Button
            type="button"
            size="sm"
            variant={layout === "detailed" ? "default" : "ghost"}
            className={cn(
              "rounded-full px-3.5 text-xs sm:text-sm",
              layout !== "detailed" && "text-muted-foreground",
            )}
            onClick={() => setLayout("detailed")}
          >
            <RectangleHorizontal className="size-4" />
            Detailed
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div
        className={cn(
          "gap-3 md:gap-4 transition-all",
          layout === "classic"
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "flex flex-col",
        )}
      >
        {safeProducts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No products found
          </div>
        ) : (
          safeProducts.map((p) => (
            <ProductCard
              key={p._id?.toString?.() ?? p._id}
              product={p}
              layout={layout}
            />
          ))
        )}
      </div>
    </div>
  );
}
