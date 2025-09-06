"use client";

import { useEffect } from "react";
import { IProduct } from "@/lib/db/models/product.model";
import ProductCard from "@/components/shared/product/product-card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function WishlistClient({ products }: { products: IProduct[] }) {
  const { data: session } = useSession();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/wishlist");
  }

  const { products: wishlistProducts, setProducts } = useWishlistStore();

  useEffect(() => {
    // Normalize products to plain JSON
    const normalized = products.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
    }));
    setProducts(normalized);
  }, [products, setProducts]);

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...new Map(wishlistProducts.map((p) => [p._id, p])).values()].map(
            (product) => (
              <ProductCard
                key={product._id}
                product={product}
                isInWishlist={true}
                hideDetails
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="my-8 text-xl">Oops! Your wishlist is empty.</p>
          <Link href="/" className={buttonVariants()}>
            Go to Home
          </Link>
        </div>
      )}
    </div>
  );
}
