/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingCart,
  Loader2,
  CreditCard,
  ArrowRight,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useCartStore from "@/hooks/use-cart-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { OrderItem } from "@/types";

type AddToCartProps = {
  item: OrderItem;
  minimal?: boolean;
  children?: React.ReactNode;
  enableVariantSelector?: boolean;
  availableSizes?: string[];
  availableColors?: string[];
  image?: string;
};

export default function AddToCart({
  item,
  minimal = false,
  children,
  enableVariantSelector = false,
  availableSizes,
  availableColors,
}: AddToCartProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(item.size);
  const [selectedColor, setSelectedColor] = useState(item.color);

  const sizes = useMemo(
    () => (availableSizes?.length ? availableSizes : item.size ? [item.size] : []),
    [availableSizes, item.size]
  );
  const colors = useMemo(
    () => (availableColors?.length ? availableColors : item.color ? [item.color] : []),
    [availableColors, item.color]
  );

  const showSuccess = () => {
    toast.success("Item added to cart 🛒", {
      action: (
        <Button onClick={() => router.push("/cart")}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Go to Cart
        </Button>
      ),
    });
  };

  const addWithSelections = async (selectedQty: number) => {
    const selectedItem: OrderItem = {
      ...item,
      size: selectedSize || item.size,
      color: selectedColor || item.color,
    };
    await addItem(selectedItem, selectedQty);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addWithSelections(quantity);
      showSuccess();
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyNowLoading(true);
    try {
      await addWithSelections(quantity);
      router.push(`/checkout`);
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsBuyNowLoading(false);
    }
  };

  const handleCardAddToCart = async () => {
    setIsLoading(true);
    try {
      await addWithSelections(quantity);
      showSuccess();
      setIsPickerOpen(false);
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const VariantSelector = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Select size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium",
                selectedSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {selectedSize === size && <Check className="mr-1 inline h-3 w-3" />}
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Select color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium",
                selectedColor === color
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <span
                style={{ backgroundColor: color.toLowerCase() }}
                className="mr-1.5 inline-block h-3 w-3 rounded-full border"
              />
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Quantity</p>
        <Select value={quantity.toString()} onValueChange={(i) => setQuantity(Number(i))}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue>Quantity: {quantity}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper">
            {Array.from({ length: item.countInStock }).map((_, i) => (
              <SelectItem key={i + 1} value={`${i + 1}`} className="cursor-pointer">
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Ready:</span>{" "}
        <Badge variant="outline" className="mr-1">{selectedSize || "N/A"}</Badge>
        <Badge variant="outline">{selectedColor || "N/A"}</Badge>
      </div>

      <Button className="w-full" onClick={handleCardAddToCart} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );

  if (children) {
    return (
      <span
        onClick={async () => {
          setIsLoading(true);
          try {
            await addWithSelections(1);
            showSuccess();
          } catch (error: any) {
            toast.error(`ERROR! ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        }}
        className="inline-flex cursor-pointer items-center"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
      </span>
    );
  }

  if (minimal) {
    if (enableVariantSelector) {
      return (
        <>
          <Button
            className="flex w-auto cursor-pointer items-center gap-2 rounded-full"
            onClick={() => setIsPickerOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>

          {isMobile ? (
            <Drawer open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <DrawerContent className="px-4 pb-6">
                <DrawerHeader className="px-0 text-left">
                  <DrawerTitle>Choose options</DrawerTitle>
                </DrawerHeader>
                {VariantSelector}
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose options</DialogTitle>
                </DialogHeader>
                {VariantSelector}
              </DialogContent>
            </Dialog>
          )}
        </>
      );
    }

    return (
      <Button
        className="flex w-auto cursor-pointer items-center gap-2 rounded-full"
        onClick={async () => {
          setIsLoading(true);
          try {
            await addWithSelections(1);
            showSuccess();
          } catch (error: any) {
            toast.error(`ERROR! ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger className="w-full cursor-pointer">
          <SelectValue>Quantity: {quantity}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {Array.from({ length: item.countInStock }).map((_, i) => (
            <SelectItem key={i + 1} value={`${i + 1}`} className="cursor-pointer">
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full"
        type="button"
        onClick={handleAddToCart}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>

      <Button
        variant="secondary"
        onClick={handleBuyNow}
        disabled={isBuyNowLoading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full"
      >
        {isBuyNowLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Buy Now
          </>
        )}
      </Button>
    </div>
  );
}
