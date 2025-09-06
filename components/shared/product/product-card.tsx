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
import { formatNumber, generateId, round2 } from "@/lib/utils";
import ProductPrice from "./product-price";
import ImageHover from "./image-hover";
import AddToCart from "./add-to-cart";
import WishlistIcon from "./wishlist-icon";
import { Badge } from "@/components/ui/badge";

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
  const ProductImage = () => (
    <div className="relative h-52">
      <div className="absolute top-1 right-1 z-10">
        <WishlistIcon
          productId={product._id.toString()}
          initialInWishlist={isInWishlist}
        />
      </div>

      <Link href={`/product/${product.slug}`}>
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className="relative h-52">
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
    <div className="flex-1 space-y-0.5">
      {/* <p className="font-bold">{product.brand}</p> */}
      <Link
        href={`/product/${product.slug}`}
        className="overflow-hidden text-ellipsis !text-md"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {product.name}
      </Link>
      <div className="flex gap-2 justify-center">
        <Rating rating={product.avgRating} size={4} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>

      <ProductPrice
        isDeal={product.tags.includes("todays-deal")}
        price={product.price}
        listPrice={product.listPrice}
        forListing
      />
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
      <ProductImage />
      {!hideDetails && (
        <>
          <div className="flex-1 text-center">
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card className="flex flex-col relative hover:shadow-lg rounded-sm p-0 m-0">
      <CardHeader className="p-0 m-0">
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="px-1 py-0 flex-1 text-center">
            <ProductDetails />
          </CardContent>

          <CardFooter className="mb-1 -mt-4">
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
  );
};

export default ProductCard;
