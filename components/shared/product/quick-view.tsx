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

  const content = useMemo(() => {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-semibold text-2xl">{product.name}</h2>

        <ProductPrice price={product.price} listPrice={product.listPrice} />

        <SelectVariant
          product={product}
          color={selectedColor}
          size={selectedSize}
        />

        <Separator className="my-2" />
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>
    );
  }, [product, selectedColor, selectedSize]);

  const stickyFooter = (
    <div className="border-t bg-background p-4">
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
      {product.countInStock === 0 && (
        <div className="text-destructive font-bold mt-2">Out of stock</div>
      )}
    </div>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-0 h-[90vh] flex flex-col" forceMount>
        <DrawerTitle className="sr-only">{product.name}</DrawerTitle>

        <div className="flex-1 overflow-y-auto px-4">{content}</div>

        {stickyFooter}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="p-0 max-w-5xl w-full h-[90vh] flex flex-col"
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r bg-muted flex items-center justify-center p-4">
            <ProductGallery images={product.images} />
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">{content}</div>
            {stickyFooter}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
