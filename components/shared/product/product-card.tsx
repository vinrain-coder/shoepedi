"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { Eye } from "lucide-react";
import ProductQuickView from "./quick-view";
import CompareButton from "./compare-button";
import {
  DEFAULT_PRODUCT_CARD_LAYOUT,
  ProductCardLayout,
} from "./product-card-layout";

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  isInWishlist = false,
  layout = DEFAULT_PRODUCT_CARD_LAYOUT,
}: {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
  isInWishlist?: boolean;
  layout?: ProductCardLayout;
}) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const router = useRouter();
  const primaryImage = product.images?.[0] ?? "/placeholder.png";
  const hoverImage = product.images?.[1] ?? primaryImage;
  const productPath = `/product/${product.slug}`;

  const prefetchProductDetails = () => {
    router.prefetch(productPath);
  };

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
    <div
      className={cn(
        "relative w-full overflow-hidden",
        layout === "amazon" ? "aspect-[4/5] h-56 sm:h-64" : "aspect-[3/4] h-52 sm:h-56"
      )}
    >
      {tagStyle && firstTag && (
        <Link
          href={`/tags/${encodeURIComponent(firstTag)}`}
          className="absolute -top-1.5 left-0 z-10"
        >
          <Badge
            className={cn(
              "rounded-none rounded-br-md text-[10px] uppercase font-bold px-2 py-0.5 border-none text-white cursor-pointer",
              tagStyle.className
            )}
          >
            {tagStyle.label}
          </Badge>
        </Link>
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
          <CompareButton product={product} variant="icon" />
        </div>
      )}
      <Link
        href={productPath}
        onMouseEnter={prefetchProductDetails}
        onFocus={prefetchProductDetails}
      >
        {product.images?.length > 1 ? (
          <ImageHover
            src={primaryImage}
            hoverSrc={hoverImage}
            alt={product.name}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            priority
          />
        )}
      </Link>
    </div>
  );

  const ProductDetails = () => {
    if (layout === "amazon") {
      return (
        <div className="space-y-2 text-left">
          <Link
            href={productPath}
            className="line-clamp-2 text-sm font-semibold leading-5 hover:text-primary transition"
            onMouseEnter={prefetchProductDetails}
            onFocus={prefetchProductDetails}
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Rating rating={product.avgRating} size={4} />
            <span>({formatNumber(product.numReviews)})</span>
          </div>
          <ProductPrice price={product.price} listPrice={product.listPrice} />
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {product.description || `${product.brand} • ${product.category}`}
          </p>
          <div className="text-[11px] text-muted-foreground">
            {product.countInStock > 0 ? "In stock" : "Out of stock"}
          </div>
        </div>
      );
    }

    if (layout === "minimal") {
      return (
        <div className="space-y-1 text-left">
          <Link
            href={productPath}
            className="line-clamp-1 text-sm font-medium hover:text-primary transition"
            onMouseEnter={prefetchProductDetails}
            onFocus={prefetchProductDetails}
          >
            {product.name}
          </Link>
          <ProductPrice price={product.price} listPrice={product.listPrice} />
        </div>
      );
    }

    return (
      <div className="space-y-0.5 text-center">
        <Link
          href={productPath}
          className="font-medium text-sm sm:text-base line-clamp-2 hover:text-primary transition"
          onMouseEnter={prefetchProductDetails}
          onFocus={prefetchProductDetails}
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
  };

  const AddButton = () => (
    <div className={cn("w-full", layout === "classic" ? "text-center" : "text-left")}>
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

  return (
    <>
      {hideBorder ? (
        <div className="group relative flex flex-col">
          <ProductImage withFloatingIcons />
          {!hideDetails && (
            <>
              <div className={cn("flex-1 p-3", layout === "classic" ? "text-center" : "text-left")}>
                <ProductDetails />
              </div>
              {!hideAddToCart && <AddButton />}
            </>
          )}
        </div>
      ) : (
        <Card
          className={cn(
            "group relative flex h-full flex-col rounded-sm border p-0 transition-all duration-200 hover:shadow-lg",
            layout === "amazon" && "overflow-hidden rounded-lg",
            layout === "minimal" && "border-muted/70"
          )}
        >
          <CardHeader className="p-0">
            <ProductImage withFloatingIcons />
          </CardHeader>
          {!hideDetails && (
            <>
              <CardContent
                className={cn(
                  "flex-1 px-3 pb-3 pt-3",
                  layout === "classic" && "px-0 text-center -mt-6",
                  layout === "amazon" && "pt-4",
                  layout === "minimal" && "pb-2"
                )}
              >
                <ProductDetails />
              </CardContent>

              <CardFooter
                className={cn(
                  "px-3 pb-3",
                  layout === "classic" && "mb-2 -mt-5",
                  layout !== "classic" && "pt-0"
                )}
              >
                {product.countInStock === 0 ? (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "px-3 py-2 text-sm font-semibold",
                      layout === "classic" ? "mx-auto hidden rounded-full" : "rounded-md"
                    )}
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
      )}
      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;
