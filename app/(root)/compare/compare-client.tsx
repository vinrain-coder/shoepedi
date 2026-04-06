"use client";

import type { ReactNode } from "react";
import type { IProduct } from "@/lib/db/models/product.model";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/useCompareStore";
import { formatNumber, generateId, round2 } from "@/lib/utils";
import { ArrowRight, Scale, Star, X } from "lucide-react";
import AddToCart from "@/components/shared/product/add-to-cart";

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

  const rows: Array<[string, (p: IProduct) => ReactNode]> = [
    [
      "Product",
      (p) => (
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => removeProduct(p._id.toString())}
            className="ml-auto p-1 hover:bg-background rounded-md"
            aria-label="Remove product"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <Link href={`/product/${p.slug}`} className="block">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto rounded border overflow-hidden bg-muted">
              <Image src={p.images?.[0] ?? "/placeholder.png"} alt={p.name} fill className="object-cover" />
            </div>
          </Link>
          <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary text-center leading-tight px-1">
            {p.name}
          </Link>
        </div>
      ),
    ],
    ["Price", (p) => <span className="font-semibold text-base">KES {formatNumber(p.price)}</span>],
    ["List Price", (p) => <span className="text-muted-foreground line-through text-sm">KES {formatNumber(p.listPrice)}</span>],
    ["Brand", (p) => <span className="text-sm">{p.brand || fallback}</span>],
    ["Category", (p) => <span className="text-sm">{p.category || fallback}</span>],
    [
      "Rating",
      (p) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {p.avgRating.toFixed(1)} <span className="text-muted-foreground">({formatNumber(p.numReviews)})</span>
        </span>
      ),
    ],
    [
      "Stock",
      (p) => (
        <span className={`text-sm ${p.countInStock > 0 ? "text-green-600" : "text-red-600"}`}>
          {p.countInStock > 0 ? `${p.countInStock} left` : "Out of Stock"}
        </span>
      ),
    ],
    ["Colors", (p) => <span className="text-sm">{p.colors?.length ? p.colors.join(", ") : fallback}</span>],
    ["Sizes", (p) => <span className="text-sm">{p.sizes?.length ? p.sizes.join(", ") : fallback}</span>],
    ["Tags", (p) => <span className="text-sm text-muted-foreground">{p.tags?.length ? p.tags.join(", ") : fallback}</span>],
    [
      "Action",
      (p) => (
        <div className="pt-2">
          <AddToCart
            minimal
            item={{
              clientId: generateId(),
              product: p._id.toString(),
              countInStock: p.countInStock,
              name: p.name,
              slug: p.slug,
              category: p.category,
              price: round2(p.price),
              quantity: 1,
              image: p.images?.[0],
              size: p.sizes?.[0],
              color: p.colors?.[0],
            }}
          />
        </div>
      ),
    ],
  ];

  return (
    <div className="container mx-auto py-4 md:py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold truncate">Compare Products</h1>
          <p className="text-sm text-muted-foreground">{count}/{maxItems} products</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}>Add More</Link>
          <button type="button" onClick={clearProducts} className={buttonVariants({ variant: "ghost", size: "sm", className: "text-sm" })}>Clear</button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full table-fixed border-collapse">
          <tbody className="divide-y text-base">
            {rows.map(([label, valueFn], idx) => (
              <tr key={label + idx} className="hover:bg-muted/20">
                <td className="p-4 text-sm font-bold bg-muted/30 sticky left-0 z-10 w-28 md:w-40">{label}</td>
                {products.map((product) => (
                  <td key={product._id.toString() + label} className="p-4 text-center border-l align-top min-w-[150px] md:min-w-[200px]">
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
