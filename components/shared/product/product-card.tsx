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
import { cn, formatNumber } from "@/lib/utils";
import ProductPrice from "./product-price";
import ImageHover from "./image-hover";
import WishlistIcon from "./wishlist-icon";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import ProductQuickView from "./quick-view";
import CompareButton from "./compare-button";
import CardAddToCartSelector from "./card-add-to-cart-selector";

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  isInWishlist = false,
  layout = "classic",
}: {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
  isInWishlist?: boolean;
  layout?: "classic" | "detailed";
}) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const router = useRouter();
  const primaryImage = product.images?.[0] ?? "/placeholder.png";
  const hoverImage = product.images?.[1] ?? primaryImage;
  const productPath = `/product/${product.slug}`;

  const prefetchProductDetails = () => {
    router.prefetch(productPath);
  };

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
    <div
      className={cn(
        "relative w-full overflow-hidden",
        layout === "detailed" ? "aspect-square h-56 sm:h-64 rounded-xl bg-muted/30 p-3" : "aspect-[3/4] h-52 sm:h-56",
      )}
    >
      {layout === "classic" && tagStyle && firstTag && (
        <Link href={`/tags/${encodeURIComponent(firstTag)}`} className="absolute -top-1.5 left-0 z-10">
          <Badge
            className={cn(
              "rounded-none rounded-br-md text-[10px] uppercase font-bold px-2 py-0.5 border-none text-white cursor-pointer",
              tagStyle.className,
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
            className={cn("object-cover", layout === "detailed" && "rounded-lg")}
          />
        ) : (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, 20vw"
            className={cn("object-cover", layout === "detailed" && "rounded-lg")}
            priority
          />
        )}
      </Link>{" "}
    </div>
  );
  const ProductDetails = () => (
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
      <ProductPrice price={product.price} listPrice={product.listPrice} align="center" />
    </div>
  );

  const AddButton = () => (
    <div className="w-full text-center">
      <CardAddToCartSelector product={product} />
    </div>
  );

  if (layout === "detailed") {
    return (
      <>
        <Card className="relative overflow-hidden rounded-2xl border bg-card/70 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex gap-4 md:gap-6">
            <div className="w-36 shrink-0 sm:w-44">
              <ProductImage />
              {!!product.images?.length && (
                <div className="mt-3 flex gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <div key={`${image}-${index}`} className="relative h-14 w-14 overflow-hidden rounded-md border bg-muted/40">
                      <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {tagStyle && firstTag && (
                  <Link href={`/tags/${encodeURIComponent(firstTag)}`}>
                    <Badge className={cn("text-[10px] text-white", tagStyle.className)}>{tagStyle.label}</Badge>
                  </Link>
                )}
                <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                {product.brand && <Badge variant="secondary" className="text-[10px]">{product.brand}</Badge>}
              </div>

              <Link href={productPath} className="line-clamp-2 text-base font-semibold hover:text-primary">
                {product.name}
              </Link>

              <p className="line-clamp-2 text-sm text-muted-foreground">{product.description || "Premium quality product designed for comfort and style."}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Rating rating={product.avgRating} size={4} />
                <span>({formatNumber(product.numReviews)})</span>
                <span>•</span>
                <span className={cn(product.countInStock > 0 ? "text-emerald-600" : "text-red-500")}>
                  {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sizes</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.slice(0, 5).map((size) => (
                    <span key={size} className="rounded-md border px-2 py-1 text-xs">{size}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.slice(0, 6).map((color) => (
                    <span key={color} title={color} className="h-5 w-5 rounded-full ring-1 ring-border" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <ProductPrice price={product.price} listPrice={product.listPrice} align="start" className="text-xl sm:text-2xl" />
            </div>

            <div className="ml-auto flex shrink-0 flex-col items-end gap-2">
              <WishlistIcon productId={product._id.toString()} initialInWishlist={isInWishlist} />
              <button className="rounded-full bg-background p-1.5 shadow hover:bg-muted" onClick={() => setShowQuickView(true)}>
                <Eye size={16} />
              </button>
              <CompareButton product={product} variant="icon" />
              {!hideAddToCart && <AddButton />}
            </div>
          </div>
        </Card>
        <ProductQuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
      </>
    );
  }

  return (
    <>
      {hideBorder ? (
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
