"use client";

import useBrowsingHistory from "@/hooks/use-browsing-history";
import React, { useEffect, useState } from "react";
import ProductSlider from "./product/product-slider";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

export default function BrowsingHistoryList({
  className,
}: {
  className?: string;
}) {
  const { products } = useBrowsingHistory();

  if (products.length === 0) return null;

  return (
    <div className="bg-background">
      <Separator className={cn("mb-4", className)} />
      <ProductList title="Related to items that you've viewed" type="related" />
      <Separator className="mb-4" />
      <ProductList title="Your browsing history" hideDetails type="history" />
    </div>
  );
}

function ProductList({
  title,
  type = "history",
  hideDetails = false,
  excludeId = "",
}: {
  title: string;
  type: "history" | "related";
  excludeId?: string;
  hideDetails?: boolean;
}) {
  const { products } = useBrowsingHistory();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      if (products.length === 0) return;

      setLoading(true);
      try {
        const query = new URLSearchParams({
          type,
          excludeId,
          categories: products.map((p) => p.category).join(","),
          ids: products.map((p) => p.id).join(","),
        });

        const res = await fetch(
          `/api/products/browsing-history?${query.toString()}`
        );
        if (!res.ok) return;
        const result = await res.json();
        if (isMounted) setData(result);
      } catch (err) {
        console.error("Failed to fetch browsing history products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [type, excludeId, products]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-4 px-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-1/2 sm:w-40 md:w-48 lg:w-56 h-60 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <ProductSlider title={title} products={data} hideDetails={hideDetails} />
  );
}
