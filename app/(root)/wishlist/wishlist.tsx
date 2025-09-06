"use client";

import { useEffect, useState } from "react";
import { IProduct } from "@/lib/db/models/product.model";
import ProductCard from "@/components/shared/product/product-card";
import Link from "next/link";
import {
  getWishlistProducts,
  getWishlist,
} from "@/lib/actions/wishlist.actions";
import { buttonVariants } from "@/components/ui/button";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]); //

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlistProducts = await getWishlistProducts();
        setProducts(wishlistProducts); //

        const ids = await getWishlist();
        setWishlistIds(ids);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              isInWishlist={wishlistIds.includes(product._id.toString())}
              hideDetails
            />
          ))}
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
