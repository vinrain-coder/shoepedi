"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeLayout, setActiveLayout] = useState<ProductCardLayout>(layout);
  const router = useRouter();
  const productPath = `/product/${product.slug}`;

  const images = useMemo(
    () => (product.images?.length ? product.images : ["/placeholder.png"]),
    [product.images]
  );
  const primaryImage = images[selectedImageIndex] ?? images[0];
  const hoverImage = images[1] ?? primaryImage;

  useEffect(() => {
    const savedLayout = window.localStorage.getItem("product_card_layout");
    if (savedLayout === "classic" || savedLayout === "split") {
      setActiveLayout(savedLayout);
    }
    const onLayoutChange = (event: Event) => {
      const nextLayout = (event as CustomEvent<string>).detail;
      if (nextLayout === "classic" || nextLayout === "split") {
        setActiveLayout(nextLayout);
      }
    };
    window.addEventListener("product-layout-change", onLayoutChange);
    return () =>
      window.removeEventListener("product-layout-change", onLayoutChange);
  }, []);

  useEffect(() => {
    if (activeLayout === "classic") {
      setSelectedImageIndex(0);
    }
  }, [activeLayout]);

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
        activeLayout === "split"
          ? "h-36 rounded-md sm:h-40"
          : "aspect-[3/4] h-52 sm:h-56"
      )}
    >
      {tagStyle && firstTag && activeLayout !== "split" && (
        <Link
          href={`/tags/${encodeURIComponent(firstTag)}`}
          className="absolute -top-1.5 left-0 z-10"
        >
          <Badge
            className={cn(
              "rounded-none rounded-br-md border-none px-2 py-0.5 text-[10px] font-bold uppercase text-white cursor-pointer",
              tagStyle.className
            )}
          >
            {tagStyle.label}
          </Badge>
        </Link>
      )}
      {withFloatingIcons && (
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
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
        className="relative block h-full w-full"
      >
        {activeLayout === "split" ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 40vw, 25vw"
            className="object-cover"
            priority
          />
        ) : product.images?.length > 1 ? (
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
    <div className={cn("w-full", activeLayout === "split" ? "text-left" : "text-center")}>
      <AddToCart
        minimal
        enableVariantSelector
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
        availableColors={product.colors}
        availableSizes={product.sizes}
        image={primaryImage}
      />
    </div>
  );

  if (activeLayout === "split" && !hideBorder) {
    return (
      <>
        <Card className="relative overflow-hidden rounded-xl border p-3 transition-shadow hover:shadow-md sm:p-4">
          <div className="grid grid-cols-[120px_1fr] gap-3 sm:grid-cols-[160px_1fr] sm:gap-5">
            <div className="space-y-2">
              <ProductImage />
              {images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {images.slice(0, 4).map((img, index) => (
                    <button
                      key={`${product._id.toString()}-${index}`}
                      type="button"
                      className={cn(
                        "relative h-12 w-12 shrink-0 overflow-hidden rounded border",
                        index === selectedImageIndex
                          ? "border-primary"
                          : "border-muted"
                      )}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={productPath}
                  className="line-clamp-2 text-sm font-semibold leading-5 hover:text-primary sm:text-base"
                  onMouseEnter={prefetchProductDetails}
                  onFocus={prefetchProductDetails}
                >
                  {product.name}
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                  <WishlistIcon
                    productId={product._id.toString()}
                    initialInWishlist={isInWishlist}
                  />
                  <button
                    className="rounded-full border bg-background p-1.5 hover:bg-muted"
                    onClick={() => setShowQuickView(true)}
                  >
                    <Eye size={15} />
                  </button>
                  <CompareButton product={product} variant="icon" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {firstTag && tagStyle && (
                  <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase">
                    {tagStyle.label}
                  </Badge>
                )}
                <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                    {product.brand}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Rating rating={product.avgRating} size={4} />
                <span>({formatNumber(product.numReviews)})</span>
              </div>

              <ProductPrice
                price={product.price}
                listPrice={product.listPrice}
                align="start"
              />

              <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {product.description || "Premium quality product with fast delivery and easy returns."}
              </p>

              <div className="space-y-1 text-[11px] text-muted-foreground sm:text-xs">
                <p className="font-medium">
                  Stock: {product.countInStock > 0 ? `${product.countInStock} available` : "Out of stock"}
                </p>
                <p className="line-clamp-1">Sizes: {product.sizes.slice(0, 4).join(", ") || "N/A"}</p>
                <div className="flex items-center gap-1.5">
                  <span>Colors:</span>
                  <div className="flex gap-1.5">
                    {product.colors.slice(0, 5).map((color) => (
                      <span
                        key={color}
                        style={{ backgroundColor: color.toLowerCase() }}
                        className="h-3.5 w-3.5 rounded-full border border-border"
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {!hideAddToCart && <AddButton />}
            </div>
          </div>
        </Card>

        <ProductQuickView
          product={product}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      </>
    );
  }

  return (
    <>
      {hideBorder ? (
        <div className="relative flex flex-col">
          <ProductImage withFloatingIcons />
          {!hideDetails && (
            <>
              <div className="flex-1 p-3 text-center">
                <div className="space-y-0.5 text-center">
                  <Link
                    href={productPath}
                    className="line-clamp-2 text-sm font-medium transition hover:text-primary sm:text-base"
                    onMouseEnter={prefetchProductDetails}
                    onFocus={prefetchProductDetails}
                  >
                    {product.name}
                  </Link>
                  <div className="flex justify-center gap-1 text-xs text-gray-500">
                    <Rating rating={product.avgRating} size={4} />
                    <span>({formatNumber(product.numReviews)})</span>
                  </div>
                  <ProductPrice price={product.price} listPrice={product.listPrice} />
                </div>
              </div>
              {!hideAddToCart && <AddButton />}
            </>
          )}
        </div>
      ) : (
        <Card className="relative flex flex-col rounded-sm p-0 hover:shadow-lg">
          <CardHeader className="p-0">
            <ProductImage withFloatingIcons />
          </CardHeader>
          {!hideDetails && (
            <>
              <CardContent className="-mt-6 flex-1 px-0 text-center">
                <div className="space-y-0.5 text-center">
                  <Link
                    href={productPath}
                    className="line-clamp-2 text-sm font-medium transition hover:text-primary sm:text-base"
                    onMouseEnter={prefetchProductDetails}
                    onFocus={prefetchProductDetails}
                  >
                    {product.name}
                  </Link>
                  <div className="flex justify-center gap-1 text-xs text-gray-500">
                    <Rating rating={product.avgRating} size={4} />
                    <span>({formatNumber(product.numReviews)})</span>
                  </div>
                  <ProductPrice price={product.price} listPrice={product.listPrice} />
                </div>
              </CardContent>

              <CardFooter className="-mt-5 mb-2">
                {product.countInStock === 0 ? (
                  <Badge
                    variant="destructive"
                    className="mx-auto hidden rounded-full px-3 py-2 text-sm font-semibold"
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
