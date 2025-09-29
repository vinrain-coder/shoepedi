"use client";

import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import ProductGallery from "@/components/shared/product/product-gallery";
import ProductPrice from "@/components/shared/product/product-price";
import AddToCart from "@/components/shared/product/add-to-cart";
import SelectVariant from "@/components/shared/product/select-variant";
import { IProduct } from "@/lib/db/models/product.model";
import { generateId, round2 } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import SubscribeButton from "./stock-subscription-button";

interface QuickViewProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({
  product,
  isOpen,
  onClose,
}: QuickViewProps) {
  const isMobile = useIsMobile();

  if (!product) return null;

  const selectedColor = product.colors?.[0];
  const selectedSize = product.sizes?.[0];

  const details = useMemo(() => {
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Product Name */}
        <h2 className="font-semibold text-2xl">{product.name}</h2>

        {/* Price */}
        <ProductPrice price={product.price} listPrice={product.listPrice} />

        {/* Variants */}
        <SelectVariant
          product={product}
          color={selectedColor}
          size={selectedSize}
        />

        {/* Description */}
        <Separator />
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {product.description}
        </p>

        {/* Add to Cart */}
        <AddToCart
          item={{
            clientId: generateId(),
            product: product._id.toString(),
            countInStock: product.countInStock,
            name: product.name,
            slug: product.slug,
            category: product.category,
            price: round2(product.price),
            quantity: 1,
            image: product.images[0],
            size: selectedSize,
            color: selectedColor,
          }}
        />

        {product.countInStock > 0 && product.countInStock <= 3 && (
          <div className="text-destructive font-bold">
            Only {product.countInStock} left in stock – order soon
          </div>
        )}

        {product.countInStock === 0 && (
          <div className="flex justify-center items-center mt-4">
            <SubscribeButton productId={product._id.toString()} />
          </div>
        )}
      </div>
    );
  }, [product, selectedColor, selectedSize]);

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-0 max-h-[90vh] flex flex-col" forceMount>
        <DrawerTitle className="sr-only">{product.name}</DrawerTitle>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <ProductGallery images={product.images} />
          {details}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="p-0 w-full h-[65vh] overflow-hidden rounded-2xl grid grid-cols-1 md:grid-cols-2 md:gap-6 max-w-2xl md:!max-w-6xl"
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        {/* Left: gallery */}
        <div className="p-6 overflow-y-auto border-r">
          <ProductGallery images={product.images} />
        </div>

        {/* Right: details */}
        <div className="overflow-y-auto">{details}</div>
      </DialogContent>
    </Dialog>
  );
}
