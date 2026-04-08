"use client";

import { useEffect, useMemo, useState } from "react";
import useBrowsingHistory from "@/hooks/use-browsing-history";
import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Breadcrumb from "@/components/shared/breadcrumb";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function BrowsingHistoryPage() {
  const { products: historyItems, removeItem, clear } = useBrowsingHistory();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = useMemo(
    () => historyItems.map((p) => p.id).filter(Boolean).join(","),
    [historyItems]
  );

  const categories = useMemo(
    () =>
      [...new Set(historyItems.map((p) => p.category).filter(Boolean))].join(","),
    [historyItems]
  );

  useEffect(() => {
    if (!ids) {
      setData([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          type: "history",
          ids,
          categories,
        });

        const res = await fetch(
          `/api/products/browsing-history?${query.toString()}`
        );

        if (!res.ok) throw new Error("Request failed");

        const result = await res.json();
        if (!mounted) return;

        setData(result.history ?? result ?? []);
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

  return (
    <div className="container mx-auto">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browsing History</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage the products you've viewed.
          </p>
        </div>
        {historyItems.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clear();
              setData([]);
            }}
            className="text-destructive hover:text-destructive"
          >
            Clear all items
          </Button>
        )}
      </div>

      <Separator className="mb-8" />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] w-full bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted p-6 rounded-full mb-4">
            <Trash2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Your history is empty</h2>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">
            You haven't viewed any products yet. Start browsing to see your history here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Go Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {data.map((product) => (
            <div key={product._id} className="group relative flex flex-col">
              <ProductCard product={product} hideDetails />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 self-center"
                onClick={() => {
                  removeItem(product._id);
                  setData((prev) => prev.filter((p) => p._id !== product._id));
                }}
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
