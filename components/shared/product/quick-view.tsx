"use client";

import React, { useEffect, useState } from "react";
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
import MarkdownRenderer from "../markdown-renderer";
import ReadMore from "../read-more";
import { Badge } from "@/components/ui/badge";

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

  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  useEffect(() => {
    if (!product || !isOpen) return;

    setSelectedColor(product.colors?.[0]);
    setSelectedSize(product.sizes?.[0]);
  }, [product, isOpen]);

  if (!product) return null;

  const primaryImage = product.images?.[0] ?? "/placeholder.png";

  const details = (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="font-semibold text-2xl">{product.name}</h2>

      <ProductPrice price={product.price} listPrice={product.listPrice} />

      <SelectVariant
        product={product}
        color={selectedColor}
        size={selectedSize}
        syncUrl={false}
        onVariantChange={({ color, size }) => {
          setSelectedColor(color);
          setSelectedSize(size);
        }}
      />

      <Separator />
      <section className="max-w-5xl mx-auto">
        <h2 className="font-bold text-lg mb-2">Product Description</h2>
        <ReadMore maxHeight={180}>
          <MarkdownRenderer
            content={product.description}
            className="prose prose-lg max-w-none"
          />
        </ReadMore>
      </section>

      {product.countInStock === 0 ? (
        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <Badge variant="destructive" className="w-fit">
            Out of stock
          </Badge>
          <p className="text-sm text-muted-foreground">
            This item is currently unavailable. Subscribe to get notified as
            soon as it is back in stock.
          </p>
          <SubscribeButton productId={product._id.toString()} />
        </div>
      ) : (
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
            image: primaryImage,
            size: selectedSize,
            color: selectedColor,
          }}
        />
      )}

      {product.countInStock > 0 && product.countInStock <= 3 && (
        <div className="text-destructive font-bold">
          Only {product.countInStock} left in stock – order soon
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-0 max-h-[95vh] flex flex-col" forceMount>
        <DrawerTitle className="sr-only">{product.name}</DrawerTitle>
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="px-4 pt-4">
            <ProductGallery images={product.images} />
            {product.videoLink && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Product Video</h3>
                <a
                  href={product.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Watch Here
                </a>
              </div>
            )}
          </div>
          {details}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="p-0 w-full h-[70vh] overflow-hidden rounded-2xl grid grid-cols-1 md:grid-cols-2 md:gap-6 max-w-2xl md:max-w-6xl!"
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        <div className="p-6 overflow-y-auto">
          <ProductGallery images={product.images} />
          {product.videoLink && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Product Video</h3>
              <a
                href={product.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Watch Here
              </a>
            </div>
          )}
        </div>

        <div className="overflow-y-auto">{details}</div>
      </DialogContent>
    </Dialog>
  );
}
