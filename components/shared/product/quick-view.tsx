"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import ProductGallery from "@/components/shared/product/product-gallery";
import ProductPrice from "@/components/shared/product/product-price";
import AddToCart from "@/components/shared/product/add-to-cart";
import SelectVariant from "@/components/shared/product/select-variant";
import { getProductById } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { generateId, round2 } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickViewProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({
  productId,
  isOpen,
  onClose,
}: QuickViewProps) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!productId) return;
    getProductById(productId).then((p) => setProduct(p));
  }, [productId]);

  if (!product || !isOpen) return null; // render nothing if closed

  const selectedColor = product.colors[0];
  const selectedSize = product.sizes[0];

  const content = (
    <div className="flex flex-col md:flex-row gap-4 p-4 w-full max-w-3xl">
      <div className="md:w-1/2">
        <ProductGallery
          images={product.images}
          selectedColor={selectedColor}
          colors={product.colors}
        />
      </div>

      <div className="md:w-1/2 flex flex-col gap-4">
        <h2 className="font-bold text-lg">{product.name}</h2>
        <ProductPrice price={product.price} listPrice={product.listPrice} />

        <SelectVariant
          product={product}
          color={selectedColor}
          size={selectedSize}
        />

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
          <div className="text-destructive font-bold">Out of stock</div>
        )}

        <Separator className="my-2" />
        <p className="text-sm text-gray-600">{product.description}</p>
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>{content}</DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
}
