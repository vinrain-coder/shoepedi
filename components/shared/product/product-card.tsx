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

  // Helper to determine tag color and label
  const getTagStyles = (tag: string) => {
    const normalizedTag = tag.toLowerCase();
    switch (normalizedTag) {
      case "todays-deal":
        return { label: "Today's Deal", className: "bg-red-600 hover:bg-red-600" };
      case "new-arrival":
        return { label: "New Arrival", className: "bg-blue-600 hover:bg-blue-600" };
      case "featured":
        return { label: "Featured", className: "bg-purple-600 hover:bg-purple-600" };
      case "best-seller":
        return { label: "Best Seller", className: "bg-orange-500 hover:bg-orange-500" };
      default:
        return { label: tag, className: "bg-black hover:bg-black" };
    }
  };

  const firstTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;
  const tagStyle = firstTag ? getTagStyles(firstTag) : null;

  const ProductImage = ({ withFloatingIcons = false }) => (
    <div className="relative w-full aspect-[3/4] overflow-hidden h-52 sm:h-56">
      {tagStyle && (
        <Badge 
          className={cn(
            "absolute top-0 left-0 z-10 rounded-none rounded-br-md text-[10px] uppercase font-bold px-2 py-1 border-none text-white",
            tagStyle.className
          )}
        >
          {tagStyle.label}
        </Badge>
      )}
      {withFloatingIcons && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          <WishlistIcon
            productId={product._id.toString()}
            initialInWishlist={isInWishlist}
          />
          <button
            className="rounded-full bg-background p-1.5 shadow hover:bg-muted transition-colors"
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
      </Link>
    </div>
  );

  const ProductDetails = () => (
    <div className="space-y-1 text-center">
      <Link
        href={`/product/${product.slug}`}
        className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors px-2 block"
      >
        {product.name}
      </Link>
      <div className="flex gap-1 justify-center items-center text-[11px] text-gray-500">
        <Rating rating={product.avgRating} size={12} />
        <span className="mt-0.5">({formatNumber(product.numReviews)})</span>
      </div>
      <div className="pt-1">
        <ProductPrice 
          price={product.price} 
          listPrice={product.listPrice} 
          isDeal={firstTag === "todays-deal"} 
        />
      </div>
    </div>
  );

  const AddButton = () => (
    <div className="w-full px-3 py-2">
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
    <div className="flex flex-col relative group">
      <ProductImage withFloatingIcons />
      {!hideDetails && (
        <>
          <div className="py-3 flex-1">
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <>
      <Card className="flex flex-col relative hover:shadow-xl transition-shadow duration-300 rounded-md overflow-hidden border-muted/60">
        <CardHeader className="p-0">
          <ProductImage withFloatingIcons />
        </CardHeader>
        {!hideDetails && (
          <>
            <CardContent className="p-3 flex-1">
              <ProductDetails />
            </CardContent>
            <CardFooter className="p-0 border-t border-muted/40">
              {product.countInStock === 0 ? (
                <div className="w-full py-3 text-center text-xs font-bold text-destructive uppercase tracking-widest">
                  Sold Out
                </div>
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
