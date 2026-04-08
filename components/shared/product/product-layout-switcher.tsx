"use client";

import { Grid2X2, RectangleHorizontal } from "lucide-react";

import useProductLayoutStore from "@/hooks/use-product-layout-store";
import { IProduct } from "@/lib/db/models/product.model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ProductCard from "./product-card";

export default function ProductLayoutSwitcher({ products }: { products: IProduct[] }) {
  const { layout, setLayout } = useProductLayoutStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-lg border bg-background p-1">
          <Button
            type="button"
            size="sm"
            variant={layout === "classic" ? "default" : "ghost"}
            onClick={() => setLayout("classic")}
          >
            <Grid2X2 className="size-4" />
            Classic
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layout === "detailed" ? "default" : "ghost"}
            onClick={() => setLayout("detailed")}
          >
            <RectangleHorizontal className="size-4" />
            Detailed
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "gap-3 md:gap-4",
          layout === "classic" ? "grid grid-cols-2 md:grid-cols-3" : "flex flex-col",
        )}
      >
        {products.length === 0 ? (
          <div>No product found</div>
        ) : (
          products.map((p) => <ProductCard key={p._id.toString()} product={p} layout={layout} />)
        )}
      </div>
    </div>
  );
}
