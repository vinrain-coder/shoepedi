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
}: {
  item: OrderItem;
  minimal?: boolean;
}) {
  const router = useRouter();

  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false); // Loading for "Buy Now"

  const handleAddToCart = async () => {
    setIsLoading(true); // Start loading
    try {
      const itemId = await addItem(item, quantity);
      router.push(`/cart/${itemId}`);
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleBuyNow = async () => {
    setIsBuyNowLoading(true); // Start loading for "Buy Now"
    try {
      addItem(item, quantity);
      router.push(`/checkout`);
    } catch (error: any) {
      toast.error(`ERROR! ${error.message}`);
    } finally {
      setIsBuyNowLoading(false); // End loading for "Buy Now"
    }
  };

  return minimal ? (
    <Button
      className="rounded-full w-auto cursor-pointer"
      onClick={async () => {
        setIsLoading(true); // Start loading
        try {
          addItem(item, 1);
          toast.success("Item added to cart", {
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
          setIsLoading(false); // End loading
        }
      }}
      disabled={isLoading} // Disable the button while loading
    >
      {isLoading ? "Loading..." : "Add to Cart"}
    </Button>
  ) : (
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
            <SelectItem key={i + 1} value={`${i + 1}`} className="cursor-pointer">
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="rounded-full w-full cursor-pointer"
        type="button"
        onClick={handleAddToCart}
        disabled={isLoading} // Disable the button while loading
      >
        {isLoading ? "Loading..." : "Add to Cart"}
      </Button>
      <Button
        variant="secondary"
        onClick={handleBuyNow}
        disabled={isBuyNowLoading} // Disable the button while loading
        className="w-full rounded-full cursor-pointer"
      >
        {isBuyNowLoading ? "Loading..." : "Buy Now"}
      </Button>
    </div>
  );
}
