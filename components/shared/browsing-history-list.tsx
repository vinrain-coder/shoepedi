"use client";

import { useEffect, useMemo, useState } from "react";
import useBrowsingHistory from "@/hooks/use-browsing-history";
import ProductSlider from "./product/product-slider";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

// Client-side memory cache
const requestCache = new Map<string, any>();

export default function BrowsingHistoryList({
  className,
}: {
  className?: string;
}) {
  const { products } = useBrowsingHistory();

  // Memoized values
  const ids = useMemo(
    () => products.map((p) => p.id).filter(Boolean).join(","),
    [products]
  );

  const categories = useMemo(
    () =>
      [...new Set(products.map((p) => p.category).filter(Boolean))].join(","),
    [products]
  );

  const [data, setData] = useState<{
    history: any[];
    related: any[];
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ids) {
      setLoading(false);
      return;
    }

    const cacheKey = `browsing-${ids}-${categories}`;

    if (requestCache.has(cacheKey)) {
      setData(requestCache.get(cacheKey));
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          type: "both",
          ids,
          categories,
        });

        const res = await fetch(
          `/api/products/browsing-history?${query.toString()}`
        );

        if (!res.ok) throw new Error("Request failed");

        const result = await res.json();
        if (!mounted) return;

        requestCache.set(cacheKey, result);
        setData(result);
      } catch (err) {
        console.error("Browsing history fetch failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [ids, categories]);

  if (!products.length) return null;

  const relatedProducts = data?.related ?? [];
  const historyProducts = data?.history ?? [];

  const showRelated = relatedProducts.length > 0;
  const showHistory = historyProducts.length > 0;

  return (
    <div className="bg-background">
      {/* RELATED SECTION */}
      {showRelated && (
        <>
          <Separator className={cn("mb-4", className)} />
          <ProductSection
            title="Related to items that you've viewed"
            products={relatedProducts}
            loading={loading}
          />
        </>
      )}

      {/* HISTORY SECTION */}
      {showHistory && (
        <>
          <Separator className="mb-4" />
          <ProductSection
            title="Your browsing history"
            products={historyProducts}
            hideDetails
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

function ProductSection({
  title,
  products,
  loading,
  hideDetails = false,
}: {
  title: string;
  products: any[];
  loading: boolean;
  hideDetails?: boolean;
}) {
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

  if (!products.length) return null;

  return (
    <ProductSlider
      title={title}
      products={products}
      hideDetails={hideDetails}
    />
  );
      }
  
