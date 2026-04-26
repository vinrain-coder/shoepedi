"use client";

import { useTransition } from "react";
import ProductLayoutSwitcher from "@/components/shared/product/product-layout-switcher";
import ProductLoadingOverlay from "@/components/shared/product/product-loading-overlay";
import useProductLayoutStore from "@/hooks/use-product-layout-store";

export default function SearchProductsClient({
  products,
}: {
  products: any[];
}) {
  const { layout } = useProductLayoutStore();
  const [isPending] = useTransition(); // optional fallback

  return (
    <div className="md:col-span-4 space-y-4 relative">
      {/* Loading overlay ONLY over products */}
      {isPending && (
        <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm">
          <ProductLoadingOverlay layout={layout} />
        </div>
      )}

      <ProductLayoutSwitcher products={products} />
    </div>
  );
}
