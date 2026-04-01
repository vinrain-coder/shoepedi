"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/useCompareStore";
import { formatNumber } from "@/lib/utils";
import { ArrowRight, Scale, Star, Trash2, X } from "lucide-react";

const fallback = "—";

export default function CompareClient() {
  const { products, removeProduct, clearProducts, count, maxItems } = useCompareStore();

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Scale className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Compare Products</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Add up to {maxItems} products to compare specs side by side
        </p>
        <Link href="/search" className={buttonVariants({ size: "sm" })}>
          Browse Products <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-semibold truncate">Compare</h1>
          <p className="text-xs text-muted-foreground">
            {count}/{maxItems}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}>
            Add More
          </Link>
          <button
            type="button"
            onClick={clearProducts}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Desktop: Table View */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 w-32 text-left text-xs font-medium sticky left-0 bg-muted/50"></th>
              {products.map((product) => (
                <th key={product._id.toString()} className="p-2 border-l w-48">
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => removeProduct(product._id.toString())}
                      className="ml-auto p-1 hover:bg-background rounded-md transition-colors"
                      aria-label="Remove product"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="relative w-20 h-20 mx-auto rounded border overflow-hidden bg-muted">
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
                      className="line-clamp-2 text-xs font-medium hover:text-primary text-center leading-tight px-1"
                    >
                      {product.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y text-sm">
            {[
              ["Price", (p: any) => <span className="font-semibold">KES {formatNumber(p.price)}</span>],
              ["List Price", (p: any) => <span className="text-muted-foreground line-through text-xs">KES {formatNumber(p.listPrice)}</span>],
              ["Brand", (p: any) => p.brand || fallback],
              ["Category", (p: any) => <span className="text-xs">{p.category || fallback}</span>],
              [
                "Rating",
                (p: any) => (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {p.avgRating.toFixed(1)} <span className="text-muted-foreground">({formatNumber(p.numReviews)})</span>
                  </span>
                ),
              ],
              [
                "Stock",
                (p: any) => (
                  <span className={`text-xs ${p.countInStock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {p.countInStock > 0 ? `${p.countInStock} left` : "Out"}
                  </span>
                ),
              ],
              ["Colors", (p: any) => <span className="text-xs">{p.colors?.length ? p.colors.join(", ") : fallback}</span>],
              ["Sizes", (p: any) => <span className="text-xs">{p.sizes?.length ? p.sizes.join(", ") : fallback}</span>],
              ["Tags", (p: any) => <span className="text-xs text-muted-foreground">{p.tags?.length ? p.tags.join(", ") : fallback}</span>],
            ].map(([label, valueFn], idx) => (
              <tr key={label + idx} className="hover:bg-muted/30">
                <td className="p-2 text-xs font-medium bg-muted/30 sticky left-0">{label}</td>
                {products.map((product) => (
                  <td key={product._id.toString() + label} className="p-2 text-center border-l">
                    {valueFn(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <div key={product._id.toString()} className="border rounded-lg p-3 bg-card">
            <div className="flex gap-3 mb-3">
              <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                <div className="relative w-20 h-20 rounded border overflow-hidden bg-muted">
                  <Image
                    src={product.images?.[0] ?? "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${product.slug}`}
                  className="line-clamp-2 text-sm font-medium hover:text-primary mb-1"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{product.avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({formatNumber(product.numReviews)})</span>
                </div>
                <div className="text-sm font-semibold">KES {formatNumber(product.price)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(product._id.toString())}
                className="p-1.5 hover:bg-muted rounded-md h-fit"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t pt-2">
              <div>
                <span className="text-muted-foreground">Brand:</span> {product.brand || fallback}
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span> {product.category || fallback}
              </div>
              <div>
                <span className="text-muted-foreground">Stock:</span>{" "}
                <span className={product.countInStock > 0 ? "text-green-600" : "text-red-600"}>
                  {product.countInStock > 0 ? `${product.countInStock} left` : "Out"}
                </span>
              </div>
              {product.colors?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Colors:</span> {product.colors.join(", ")}
                </div>
              )}
              {product.sizes?.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Sizes:</span> {product.sizes.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
          }
        
