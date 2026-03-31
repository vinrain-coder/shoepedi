"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCompareStore } from "@/hooks/useCompareStore";
import { formatNumber } from "@/lib/utils";
import { ArrowRight, Scale, Star, Trash2 } from "lucide-react";
import { ReactNode } from "react";

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
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Compare</h1>
          <p className="text-muted-foreground text-sm">
            {count} of {maxItems} products selected.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[900px] gap-3" style={{ gridTemplateColumns: `220px repeat(${products.length}, minmax(200px, 1fr))` }}>
          <div />
          {products.map((product) => (
            <Card key={product._id.toString()} className="overflow-hidden">
              <CardContent className="p-3 space-y-3">
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
                    <Image
                      src={product.images?.[0] ?? "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                  {product.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeProduct(product._id.toString())}
                  className={buttonVariants({ variant: "outline", className: "w-full" })}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </CardContent>
            </Card>
          ))}

          <CompareLabel>Price</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-price`}>
              KES {formatNumber(product.price)}
            </CompareValue>
          ))}

          <CompareLabel>List price</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-list-price`}>
              KES {formatNumber(product.listPrice)}
            </CompareValue>
          ))}

          <CompareLabel>Brand</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-brand`}>{product.brand || fallback}</CompareValue>
          ))}

          <CompareLabel>Category</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-category`}>{product.category || fallback}</CompareValue>
          ))}

          <CompareLabel>Rating</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-rating`}>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {product.avgRating.toFixed(1)} ({formatNumber(product.numReviews)} reviews)
              </span>
            </CompareValue>
          ))}

          <CompareLabel>Availability</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-stock`}>
              {product.countInStock > 0 ? `In stock (${product.countInStock})` : "Out of stock"}
            </CompareValue>
          ))}

          <CompareLabel>Colors</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-colors`}>
              {product.colors?.length ? product.colors.join(", ") : fallback}
            </CompareValue>
          ))}

          <CompareLabel>Sizes</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-sizes`}>
              {product.sizes?.length ? product.sizes.join(", ") : fallback}
            </CompareValue>
          ))}

          <CompareLabel>Tags</CompareLabel>
          {products.map((product) => (
            <CompareValue key={`${product._id.toString()}-tags`}>
              {product.tags?.length ? product.tags.join(", ") : fallback}
            </CompareValue>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareLabel({ children }: { children: ReactNode }) {
  return <div className="rounded-md border bg-muted/60 p-3 text-sm font-semibold">{children}</div>;
}

function CompareValue({ children }: { children: ReactNode }) {
  return <div className="rounded-md border p-3 text-sm">{children}</div>;
}
