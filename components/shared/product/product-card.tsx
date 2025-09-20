"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { IProduct } from "@/lib/db/models/product.model";

import Rating from "./rating";
import { formatNumber, generateId, round2 } from "@/lib/utils";
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
  const discount =
    product.listPrice && product.listPrice > product.price
      ? Math.round(
          ((product.listPrice - product.price) / product.listPrice) * 100
        )
      : null;

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

  const ProductImage = ({ withFloatingIcons = false }) => (
    <div className="relative h-52 sm:h-56">
      {discount && (
        <Badge
          variant="destructive"
          className="absolute z-10 px-2 py-0.5 text-xs font-semibold rounded-none rounded-tl-md rounded-br-md shadow-md top-1 left-1"
        >
          {discount}% OFF
        </Badge>
      )}

      {withFloatingIcons && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1.5">
          <WishlistIcon
            productId={product._id.toString()}
            initialInWishlist={isInWishlist}
          />
          <AddToCart item={cartItem}>
            <Button className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition">
              <ShoppingCart size={16} className="text-gray-700" />
            </Button>
          </AddToCart>
        </div>
      )}

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
    <div className="space-y-0.5 text-center">
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
      <ProductPrice price={product.price} listPrice={product.listPrice} />
    </div>
  );

  return hideBorder ? (
    <div className="flex flex-col relative">
      <ProductImage withFloatingIcons />
      {!hideDetails && <ProductDetails />}
    </div>
  ) : (
    <Card className="flex flex-col relative hover:shadow-md rounded-md overflow-hidden transition p-0 m-0">
      <CardHeader className="p-0">
        <ProductImage withFloatingIcons />
      </CardHeader>

      {!hideDetails && (
        <>
          <CardContent className="px-1 py-1 mb-1">
            <ProductDetails />
          </CardContent>

          {/* <CardFooter className="flex justify-between items-center px-2 py-1.5">
            {product.countInStock === 0 ? (
              <Badge
                variant="destructive"
                className="px-3 py-0.5 text-xs font-semibold rounded-none shadow-md"
              >
                Out of Stock
              </Badge>
            ) : (
              !hideAddToCart && (
                <AddToCart item={cartItem}>
                  <Button size="sm" className="flex items-center gap-1 text-xs">
                    <ShoppingCart size={14} /> Add
                  </Button>
                </AddToCart>
              )
            )}
          </CardFooter> */}
        </>
      )}
    </Card>
  );
};

export default ProductCard;
