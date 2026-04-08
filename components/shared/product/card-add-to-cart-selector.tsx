"use client";

import { useState } from "react";
import { Check, Loader2, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, round2 } from "@/lib/utils";

export default function CardAddToCartSelector({ product }: { product: any }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  const SelectionContent = (
    <div className="space-y-10 py-6">
      {/* Sizes: Clean Grid, No Backgrounds */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Size</span>
          <div className="h-[1px] flex-1 bg-border/50" />
        </div>
        <div className="flex flex-wrap gap-3">
          {product.sizes.map((size: string) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "relative min-w-[3rem] px-2 py-1.5 text-sm transition-all",
                "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-primary after:transition-transform",
                selectedSize === size ? "text-primary after:scale-x-100" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* Colors: Floating Circles */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Color</span>
          <div className="h-[1px] flex-1 bg-border/50" />
        </div>
        <div className="flex flex-wrap gap-4">
          {product.colors.map((color: string) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "h-7 w-7 rounded-full border border-black/5 transition-all hover:scale-110",
                selectedColor === color ? "ring-2 ring-primary ring-offset-4" : "opacity-80 hover:opacity-100"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>

      {/* Bottom Action: Pure White/Transparent */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <div className="space-y-1">
            <span className="block text-[10px] uppercase tracking-tighter text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-primary transition-colors">
                    <Minus className="size-3" />
                </button>
                <span className="text-sm font-medium tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))} className="hover:text-primary transition-colors">
                    <Plus className="size-3" />
                </button>
            </div>
        </div>

        <Button 
            className="rounded-none h-12 px-8 bg-black hover:bg-zinc-800 text-white transition-all active:scale-95"
            onClick={() => console.log("Added")}
        >
          Add to Collection — ${round2(product.price * quantity)}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button 
        className="text-xs font-bold uppercase tracking-[0.2em] border-b-2 border-primary pb-1 hover:text-primary transition-all"
        onClick={() => setOpen(true)}
      >
        Quick Add +
      </button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-8 pb-10 border-none rounded-t-[2rem]">
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-muted" />
            <h2 className="mt-6 text-lg font-light tracking-tight">{product.name}</h2>
            {SelectionContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-10 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light tracking-tight text-left italic">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            {SelectionContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
