"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { IProduct } from "@/lib/db/models/product.model";

import Rating from "./rating";
import { formatNumber, generateId, round2 } from "@/lib/utils";
import ProductPrice from "./product-price";
import ImageHover from "./image-hover";
import AddToCart from "./add-to-cart";
import WishlistIcon from "./wishlist-icon";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart } from "lucide-react";
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
    <div className="relative h-52 sm:h-56">
      {discount && (
  <Badge
          className="absolute z-10 px-2 py-0.5 text-xs font-semibold rounded-none rounded-tl-md rounded-br-md shadow-md top-1 left-1 bg-red-600"
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
         {/*} <AddToCart item={cartItem}>
            <button
              className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingCart size={16} className="text-gray-700" />
            </button>
          </AddToCart>
          */}
          <button
            className="p-1.5 rounded-full bg-white shadow shadow-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setShowQuickView(true)}
            title="Quick View"
          >
            <Eye size={16} className="text-gray-700" />
          </button>
        </div>
      )}

      <Link href={`/product/${product.slug}`}>
        {product.images?.length > 1 ? (
          <ImageHover
            src={primaryImage}
            hoverSrc={hoverImage}
            alt={product.name}
          />
        ) : (
          <div className="relative h-56 sm:h-60">
            <Image
              src={primaryImage}
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
        <ProductImage withFloatingIcons/>
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="px-0 flex-1 text-center">
            <ProductDetails />
          </CardContent>

          <CardFooter className="mb-2 -mt-5">
            {product.countInStock === 0 ? (
              <Badge
                variant="destructive"
                className="mx-auto px-3 py-2 text-sm font-semibold rounded-full"
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
    onClose={()=>setShowQuickView(false)}
    />
    </>
  );
};

export default ProductCard;
