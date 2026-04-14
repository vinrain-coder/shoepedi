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
  const [mainImage, setMainImage] = useState(product.images?.[0] ?? "/placeholder.png");
  const router = useRouter();
  const primaryImage = mainImage;
  const hoverImage = product.images?.[1] ?? mainImage;
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
        layout === "detailed"
          ? "aspect-square min-h-[110px] rounded-xl p-2.5 sm:min-h-[160px] sm:p-3"
          : "aspect-[3/4] h-52 sm:h-56",
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
        <Rating rating={product.avgRating} size={4.5} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>
      <ProductPrice price={product.price} listPrice={product.listPrice} align="center" />
    </div>
  );

  const AddButton = ({ className }: { className?: string }) => (
    <div className={cn("w-full text-center", className)}>
      <CardAddToCartSelector product={product} />
    </div>
  );

  if (layout === "detailed") {
    return (
      <>
        <Card className="relative overflow-hidden rounded-md border border-[0.5px] p-1 pb-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-3">
          <div className="absolute right-2 top-2 z-20 flex flex-col items-center gap-1.5 sm:right-3 sm:top-3">
            <WishlistIcon productId={product._id.toString()} initialInWishlist={isInWishlist} />
          </div>
          <div className="grid grid-cols-[104px_1fr] gap-2.5 sm:grid-cols-[144px_1fr] sm:gap-3.5 lg:grid-cols-[220px_1fr] lg:gap-5">
            <div className="w-full">
              <ProductImage />
              {!!product.images?.length && (
                <div className="mt-1.5 flex gap-1 overflow-x-auto pb-1 sm:mt-2 sm:gap-1.5">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setMainImage(image)}
                      className={cn(
                        "relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md border transition-all sm:h-12 sm:w-12",
                        mainImage === image ? "border-primary ring-1 ring-primary" : "border-transparent",
                      )}
                    >
                      <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
              <div className="flex flex-wrap items-center gap-1.5 pr-9 sm:pr-10">
                {tagStyle && firstTag && (
                  <Link href={`/tags/${encodeURIComponent(firstTag)}`}>
                    <Badge className={cn("h-4 px-1.5 text-[9px] text-white", tagStyle.className)}>{tagStyle.label}</Badge>
                  </Link>
                )}
              </div>

              <Link href={productPath} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-primary sm:text-base">
                {product.name}
              </Link>

              <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{product.description || "Premium quality product designed for comfort and style."}</p>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                <Rating rating={product.avgRating} size={4.5} />
                <span>({formatNumber(product.numReviews)})</span>
                <span>•</span>
                <span className={cn(product.countInStock > 0 ? "text-emerald-600" : "text-red-500")}>
                  {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sizes</p>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.slice(0, 5).map((size) => (
                    <span key={size} className="rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px]">{size}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Colors</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.slice(0, 6).map((color) => (
                    <span key={color} title={color} className="h-4 w-4 rounded-full ring-1 ring-border sm:h-[18px] sm:w-[18px]" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-0.5 sm:pt-1">
                <ProductPrice price={product.price} listPrice={product.listPrice} align="start" className="text-lg sm:text-xl" />

                {!hideAddToCart && (
                  <AddButton className="text-left [&>button]:w-full [&>button]:sm:w-auto" />
                )}
              </div>
            </div>
          </div>
        </Card>
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
    </>
  );
};

export default ProductCard;
