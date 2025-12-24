"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardFooter,
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
import { Eye } from "lucide-react";
import ProductQuickView from "./quick-view";

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
  const [showQuickView, setShowQuickView] = useState(false);
  const primaryImage = product.images?.[0] ?? "/placeholder.png";
  const hoverImage = product.images?.[1] ?? primaryImage;

  const discount =
    product.listPrice && product.listPrice > product.price
      ? Math.round(
          ((product.listPrice - product.price) / product.listPrice) * 100
        )
      : null;

  const cartItem = {
    clientId: generateId(),
    product: product._id?.toString(),
    size: product.sizes?.[0] ?? null,
    color: product.colors?.[0] ?? null,
    countInStock: product.countInStock,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: round2(product.price),
    quantity: 1,
    image: product.images?.[0] ?? "/placeholder.png",
  };

  const ProductImage = ({ withFloatingIcons = false }) => (
    <div className="relative w-full aspect-[3/4] overflow-hidden h-52 sm:h-56">
      {discount && (
        <Badge className="absolute top-0 left-0 z-10 rounded-none rounded-br-md bg-destructive text-xs">
          {discount}% OFF
        </Badge>
      )}
      {withFloatingIcons && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          <WishlistIcon
            productId={product._id.toString()}
            initialInWishlist={isInWishlist}
          />
          <button
            className="rounded-full bg-background p-1.5 shadow hover:bg-muted"
            onClick={() => setShowQuickView(true)}
          >
            <Eye size={16} />
          </button>
        </div>
      )}
      <Link href={`/product/${product.slug}`}>
        {product.images?.length > 1 ? (
          <ImageHover
            src={primaryImage}
            hoverSrc={hoverImage}
            alt={product.name}
            className="object-cover"
          />
        ) : (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, 20vw"
            className="object-cover"
            priority
          />
        )}
      </Link>{" "}
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

  const AddButton = () => (
    <div className="w-full text-center">
      <AddToCart
        minimal
        item={{
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
        }}
      />
    </div>
  );

  return hideBorder ? (
    <div className="flex flex-col relative">
      <ProductImage withFloatingIcons />
      {!hideDetails && (
        <>
          <div className="p-3 flex-1 text-center">
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <>
      <Card className="flex flex-col relative hover:shadow-lg rounded-sm p-0">
        <CardHeader className="p-0">
          <ProductImage withFloatingIcons />
        </CardHeader>
        {!hideDetails && (
          <>
            <CardContent className="px-0 flex-1 text-center -mt-6">
              <ProductDetails />
            </CardContent>

            <CardFooter className="mb-2 -mt-5">
              {product.countInStock === 0 ? (
                <Badge
                  variant="destructive"
                  className="mx-auto px-3 py-2 text-sm font-semibold rounded-full hidden"
                >
                  Out of Stock
                </Badge>
              ) : (
                !hideAddToCart && <AddButton />
              )}
            </CardFooter>
          </>
        )}
      </Card>
      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;
