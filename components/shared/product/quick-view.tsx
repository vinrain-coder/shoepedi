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
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className="flex flex-col gap-4">
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
        <article className="prose prose-lg max-w-none mt-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => (
                <h1
                  className="text-3xl font-bold mt-5 dark:text-gray-400 text-gray-900"
                  {...props}
                />
              ),
              h2: (props) => (
                <h2
                  className="text-2xl font-semibold mt-4 dark:text-gray-400 text-gray-800"
                  {...props}
                />
              ),
              h3: (props) => (
                <h3
                  className="text-xl font-medium mt-3 dark:text-gray-400 text-gray-700"
                  {...props}
                />
              ),
              p: (props) => (
                <p
                  className="leading-relaxed my-2 dark:text-gray-300 text-gray-800"
                  {...props}
                />
              ),
              ul: (props) => (
                <ul
                  className="list-disc pl-6 my-2 dark:text-gray-300 text-gray-800"
                  {...props}
                />
              ),
              ol: (props) => (
                <ol
                  className="list-decimal pl-6 my-2 dark:text-gray-300 text-gray-800"
                  {...props}
                />
              ),
              li: (props) => (
                <li
                  className="mb-1 dark:text-gray-300 text-gray-800"
                  {...props}
                />
              ),
              blockquote: (props) => (
                <blockquote
                  className="border-l-4 border-gray-500 pl-4 italic dark:text-gray-400 text-gray-700 my-3"
                  {...props}
                />
              ),
              a: (props) => (
                <a
                  target="_self"
                  rel="noopener noreferrer"
                  className="text-blue-500 font-medium hover:underline dark:text-blue-400"
                  {...props}
                />
              ),
              strong: (props) => (
                <strong
                  className="font-semibold dark:text-white text-gray-900"
                  {...props}
                />
              ),
              pre: (props) => (
                <pre
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"
                  {...props}
                />
              ),
              img: ({ src = "", alt = "" }) => {
                if (!src) return null;

                return (
                  <Image
                    src={src as string}
                    alt={alt}
                    width={800}
                    height={450}
                    className="rounded-xl object-contain"
                    unoptimized
                  />
                );
              },
            }}
          >
            {product.description}
          </ReactMarkdown>
        </article>

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
      <DrawerContent className="p-0 max-h-[95vh] flex flex-col" forceMount>
        <DrawerTitle className="sr-only">{product.name}</DrawerTitle>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          {details}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="p-0 w-full h-[70vh] overflow-hidden rounded-2xl grid grid-cols-1 md:grid-cols-2 md:gap-6 max-w-2xl md:!max-w-6xl"
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        {/* Left: gallery */}
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

        {/* Right: details */}
        <div className="overflow-y-auto">{details}</div>
      </DialogContent>
    </Dialog>
  );
}
