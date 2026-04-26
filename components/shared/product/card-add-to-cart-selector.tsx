"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import useCartStore from "@/hooks/use-cart-store";
import { IProduct } from "@/lib/db/models/product.model";
import { cn, generateId, round2 } from "@/lib/utils";

export default function CardAddToCartSelector({
  product,
}: {
  product: IProduct;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { addItem } = useCartStore();

  const sizes = useMemo(
    () => product.sizes?.filter(Boolean) ?? [],
    [product.sizes],
  );
  const colors = useMemo(
    () => product.colors?.filter(Boolean) ?? [],
    [product.colors],
  );

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "Default");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "Default");
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = Math.max(1, product.countInStock || 1);

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
          quantity,
          image: product.images?.[0],
        },
        quantity,
      );

      setOpen(false);
      toast.success("Item added to cart", {
        description: `${product.name} x ${quantity}`,
        action: (
          <Button onClick={() => router.push("/cart")}>Go to Cart</Button>
        ),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to add item";
      toast.error(`Could not add item: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="w-auto rounded-full shadow-sm text-sm"
          disabled={product.countInStock < 1}
        >
          <ShoppingCart className="size-4" />
          {product.countInStock > 0 ? "Add to Cart" : "Out of stock"}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className={cn("w-[320px] rounded-2xl p-4", isMobile && "w-[94vw]")}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold leading-none">Quick add</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {product.name}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {product.countInStock} in stock
            </Badge>
          </div>

          {!!sizes.length && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((size) => (
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
          )}

          {!!colors.length && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "relative h-7 w-7 rounded-full border-2 border-background ring-1 ring-border transition",
                      selectedColor === color &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                    title={color}
                  >
                    {selectedColor === color && (
                      <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quantity
            </p>
            <div className="flex items-center gap-1 rounded-full border p-0.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 rounded-full"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="min-w-7 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 rounded-full"
                onClick={() =>
                  setQuantity((prev) => Math.min(maxQuantity, prev + 1))
                }
                disabled={quantity >= maxQuantity}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          <Button
            onClick={addToCart}
            disabled={isLoading || product.countInStock < 1}
            className="w-full rounded-full"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Add to cart
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
