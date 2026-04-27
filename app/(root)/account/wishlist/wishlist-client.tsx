"use client";

import { useEffect } from "react";
import { IProduct } from "@/lib/db/models/product.model";
import ProductCard from "@/components/shared/product/product-card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { ArrowRight, Heart } from "lucide-react";

export default function WishlistClient({ products }: { products: IProduct[] }) {
  const { products: wishlistProducts, setProducts } = useWishlistStore();

  useEffect(() => {
    setProducts(products);
  }, [products, setProducts]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <h2 className="text-2xl font-bold">Your Wishlist</h2>
        </div>

        {wishlistProducts.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {wishlistProducts.length} items
          </span>
        )}
      </div>

      {/* CONTENT */}
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              isInWishlist
              hideDetails
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 border rounded-xl bg-muted/30">
          <Heart className="h-10 w-10 text-muted-foreground mb-3" />

          <p className="text-lg font-semibold">Your wishlist is empty</p>

          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Save items you love and come back to them anytime.
          </p>

          <Link
            href="/search"
            className={buttonVariants({
              className: "mt-6 rounded-xl px-5 gap-2",
            })}
          >
            Discover Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
