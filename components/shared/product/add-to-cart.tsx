/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCartStore from "@/hooks/use-cart-store";
import { OrderItem } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AddToCart({
  item,
  minimal = false,
  children,
}: {
  item: OrderItem;
  minimal?: boolean;
  children?: React.ReactNode; // 👈 new
}) {
  const router = useRouter();
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const itemId = await addItem(item, quantity);
      router.push(`/cart/${itemId}`);
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyNowLoading(true);
    try {
      addItem(item, quantity);
      router.push(`/checkout`);
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsBuyNowLoading(false);
    }
  };

  // 👉 children mode (for icon buttons)
  if (children) {
    return (
      <span
        onClick={async () => {
          setIsLoading(true);
          try {
            addItem(item, 1);
            toast.success("Item added to cart🛒", {
              action: (
                <Button
                  onClick={() => {
                    router.push("/cart");
                  }}
                >
                  Go to Cart
                </Button>
              ),
            });
          } catch (error: any) {
            toast.error(`ERROR! ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        }}
        className="cursor-pointer"
      >
        {children}
      </span>
    );
  }

  // 👉 minimal mode (default simple button)
  if (minimal) {
    return (
      <Button
        className="rounded-full w-auto cursor-pointer"
        onClick={async () => {
          setIsLoading(true);
          try {
            addItem(item, 1);
            toast.success("Item added to cart🛒", {
              action: (
                <Button
                  onClick={() => {
                    router.push("/cart");
                  }}
                >
                  Go to Cart
                </Button>
              ),
            });
          } catch (error: any) {
            toast.error(`ERROR! ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Add to Cart"}
      </Button>
    );
  }

  // 👉 full mode (quantity + add + buy now)
  return (
    <div className="w-full space-y-2">
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue>Quantity: {quantity}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {Array.from({ length: item.countInStock }).map((_, i) => (
            <SelectItem
              key={i + 1}
              value={`${i + 1}`}
              className="cursor-pointer"
            >
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="rounded-full w-full cursor-pointer"
        type="button"
        onClick={handleAddToCart}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Add to Cart"}
      </Button>

      <Button
        variant="secondary"
        onClick={handleBuyNow}
        disabled={isBuyNowLoading}
        className="w-full rounded-full cursor-pointer"
      >
        {isBuyNowLoading ? "Loading..." : "Buy Now"}
      </Button>
    </div>
  );
}
