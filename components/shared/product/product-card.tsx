"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IProduct } from "@/lib/db/models/product.model";

import Rating from "./rating";
import { cn, formatNumber, generateId, round2 } from "@/lib/utils";
import ProductPrice from "./product-price";
import ImageHover from "./image-hover";
import AddToCart from "./add-to-cart";
import WishlistIcon from "./wishlist-icon";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  isInWishlist = false,
}: {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
  isInWishlist?: boolean;
}) => {
  // calculate discount percentage
  const discount =
    product.listPrice && product.listPrice > product.price
      ? Math.round(
          ((product.listPrice - product.price) / product.listPrice) * 100
        )
      : null;

  // prepare AddToCart item payload once (to reuse in button + icon)
  const cartItem = {
    clientId: generateId(),
    product: product._id.toString(),
    size: product.sizes[0],
    color: product.colors[0],
    countInStock: product.countInStock,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: round2(product.price),
    quantity: 1,
    image: product.images[0],
  };

 const ProductImage = ({ isBorderless = false }) => (
  <div className="relative h-56 sm:h-60">
    {/* discount badge top-left */}
    {discount && (
      <div className="absolute z-10">
        <Badge
          variant="destructive"
          className={cn(
            "absolute px-3 py-1.5 text-xs font-semibold rounded-none shadow-md",
            hideBorder
              ? "-top-0 -left-2 rotate-12" // slightly different for borderless cards
              : "top-3 -left-8 rotate-45" // original for cards with border
          )}
        >
          {discount}% OFF
        </Badge>
      </div>
    )}

    {/* wishlist + cart icons top-right */}
    <div
      className={cn(
        "absolute right-2 z-10 flex flex-col items-center gap-2",
        isBorderless ? "top-2" : "top-2"
      )}
    >
      <WishlistIcon
        productId={product._id.toString()}
        initialInWishlist={isInWishlist}
      />
      <AddToCart item={cartItem}>
        <Button className="p-0.5 rounded-full bg-white shadow hover:bg-gray-100 transition">
          <ShoppingCart size={18} className="text-gray-700" />
        </Button>
      </AddToCart>
    </div>

    <Link href={`/product/${product.slug}`}>
      {product.images.length > 1 ? (
        <ImageHover
          src={product.images[0]}
          hoverSrc={product.images[1]}
          alt={product.name}
        />
      ) : (
        <div className="relative h-56 sm:h-60">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="80vw"
            className="object-contain"
            priority
          />
        </div>
      )}
    </Link>
  </div>
);


  const ProductDetails = () => (
    <div className="flex-1 space-y-1 text-center">
      <Link
        href={`/product/${product.slug}`}
        className="font-medium text-sm sm:text-base line-clamp-2 hover:text-primary transition"
      >
        {product.name}
      </Link>
      <div className="flex gap-1 justify-center text-xs text-gray-500">
        <Rating rating={product.avgRating} size={4} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>
      <ProductPrice
        // isDeal={product.tags.includes("todays-deal")}
        price={product.price}
        listPrice={product.listPrice}
      />
    </div>
  );

  return hideBorder ? (
    <div className="flex flex-col relative">
      <ProductImage />
      {!hideDetails && (
        <div className="flex-1">
          <ProductDetails />
        </div>
      )}
    </div>
  ) : (
    <Card className="flex flex-col relative hover:shadow-lg rounded-md overflow-hidden transition p-0 m-0">
      <CardHeader className="">
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="px-1.5 py-1 flex-1">
            <ProductDetails />
          </CardContent>

          <CardFooter className="mb-2 -mt-2">
            {product.countInStock === 0 ? (
              <Badge
                variant="destructive"
                className="absolute top-4 left-[-20px] rotate-45 px-6 py-1.5 text-xs font-semibold rounded-none shadow-md"
              >
                Out of Stock
              </Badge>
            ) : null}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ProductCard;
