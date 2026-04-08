"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import useCartStore from "@/hooks/use-cart-store";
import { IProduct } from "@/lib/db/models/product.model";
import { cn, generateId, round2 } from "@/lib/utils";

export default function CardAddToCartSelector({ product }: { product: IProduct }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "Default");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "Default");
  const [quantity, setQuantity] = useState("1");

  const addToCart = async () => {
    setIsLoading(true);
    try {
      await addItem(
        {
          clientId: generateId(),
          product: product._id.toString(),
          size: selectedSize,
          color: selectedColor,
          countInStock: product.countInStock,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: round2(product.price),
          quantity: Number(quantity),
          image: product.images[0],
        },
        Number(quantity),
      );
      setOpen(false);
      toast.success("Item added to cart 🛒", {
        action: <Button onClick={() => router.push("/cart")}>Go to Cart</Button>,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to add item";
      toast.error(`ERROR! ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {product.sizes.map((size) => (
            <Button
              key={size}
              type="button"
              size="sm"
              className="h-8 rounded-full px-2.5 text-xs"
              variant={selectedSize === size ? "default" : "outline"}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "relative h-8 w-8 rounded-full border-2 border-background ring-1 ring-border transition",
                selectedColor === color && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
              style={{ background: color }}
              aria-label={color}
              title={color}
            >
              {selectedColor === color && <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</p>
        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: product.countInStock }).map((_, index) => (
              <SelectItem key={index + 1} value={`${index + 1}`}>
                {index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-background p-3">
        <Badge variant="outline">{product.countInStock} in stock</Badge>
        <Button onClick={addToCart} disabled={isLoading || product.countInStock < 1} className="rounded-full">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
          Add to cart
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button className="w-auto rounded-full shadow-sm text-sm" onClick={() => setOpen(true)} disabled={product.countInStock < 1}>
        <ShoppingCart className="size-4" />
        {product.countInStock > 0 ? "Add to Cart" : "Out of stock"}
      </Button>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-4 pb-5">
            <DrawerHeader className="px-0">
              <DrawerTitle className="text-left">Select options</DrawerTitle>
              <DrawerDescription className="text-left">{product.name}</DrawerDescription>
            </DrawerHeader>
            {content}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select options</DialogTitle>
              <DialogDescription>{product.name}</DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
