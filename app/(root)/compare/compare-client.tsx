"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/useCompareStore";
import { formatNumber } from "@/lib/utils";
import { ArrowRight, Scale, Star, Trash2 } from "lucide-react";

const fallback = "—";

export default function CompareClient() {
  const { products, removeProduct, clearProducts, count, maxItems } = useCompareStore();

  if (!products.length) {
    return (
      <div className="container mx-auto text-center py-10">
        <Scale className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Compare products</h2>
        <p className="mt-2 text-muted-foreground">
          Pick up to {maxItems} products to compare their price, ratings, stock, and specifications side by side.
        </p>
        <Link href="/search" className={buttonVariants({ className: "mt-6" })}>
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Product Compare</h1>
          <p className="text-muted-foreground text-sm">
            {count} of {maxItems} products selected.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/search" className={buttonVariants({ variant: "outline" })}>
            Add more products
          </Link>
          <button
            type="button"
            onClick={clearProducts}
            className={buttonVariants({ variant: "destructive" })}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-[900px] w-full table-auto border-collapse">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 w-56"></th>
              {products.map((product) => (
                <th key={product._id.toString()} className="p-3 text-center border-l">
                  <div className="flex flex-col items-center gap-2">
                    <Link href={`/product/${product.slug}`} className="block w-full">
                      <div className="relative w-32 h-32 mx-auto rounded-md border overflow-hidden">
                        <Image
                          src={product.images?.[0] ?? "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <Link
                      href={`/product/${product.slug}`}
                      className="line-clamp-2 text-sm font-semibold hover:text-primary text-center"
                    >
                      {product.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeProduct(product._id.toString())}
                      className={buttonVariants({ variant: "outline", className: "w-full mt-1 text-xs flex items-center justify-center gap-1" })}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {[
              ["Price", (p: any) => `KES ${formatNumber(p.price)}`],
              ["List Price", (p: any) => `KES ${formatNumber(p.listPrice)}`],
              ["Brand", (p: any) => p.brand || fallback],
              ["Category", (p: any) => p.category || fallback],
              [
                "Rating",
                (p: any) => (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {p.avgRating.toFixed(1)} ({formatNumber(p.numReviews)} reviews)
                  </span>
                ),
              ],
              [
                "Availability",
                (p: any) => (p.countInStock > 0 ? `In stock (${p.countInStock})` : "Out of stock"),
              ],
              ["Colors", (p: any) => (p.colors?.length ? p.colors.join(", ") : fallback)],
              ["Sizes", (p: any) => (p.sizes?.length ? p.sizes.join(", ") : fallback)],
              ["Tags", (p: any) => (p.tags?.length ? p.tags.join(", ") : fallback)],
            ].map(([label, valueFn], idx) => (
              <tr key={label + idx}>
                <td className="p-3 font-semibold bg-muted/60">{label}</td>
                {products.map((product) => (
                  <td key={product._id.toString() + label} className="p-3 text-center border-l">
                    {valueFn(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
          }
