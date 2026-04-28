import useCartStore from "@/hooks/use-cart-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { TrashIcon } from "lucide-react";
import useSettingStore from "@/hooks/use-setting-store";
import ProductPrice from "./product/product-price";

export default function CartSidebar() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore();

  const {
    setting: {
      common: { freeShippingMinPrice },
    },
  } = useSettingStore();

  return (
    <div className="w-36 overflow-hidden">
      <div className="w-36 fixed h-full border-l bg-background">
        <div className="p-1.5 h-full flex flex-col gap-3">
          {/* Header */}
          <div className="text-center space-y-2 shrink-0">
            <div className="text-sm">Subtotal</div>

            <div className="font-bold text-base">
              <ProductPrice price={itemsPrice} plain />
            </div>

            {itemsPrice > freeShippingMinPrice && (
              <div className="text-xs text-center">
                Your order qualifies for FREE Shipping
              </div>
            )}

            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full hover:no-underline w-full",
              )}
              href="/cart"
            >
              Go to Cart
            </Link>

            <Separator className="mt-3" />
          </div>

          {/* Items */}
          <ScrollArea className="flex-1 w-full pr-1">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.clientId}>
                  <div className="space-y-2">
                    <Link href={`/product/${item.slug}`}>
                      <div className="relative h-24 w-full">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="20vw"
                          className="object-contain"
                        />
                      </div>
                    </Link>

                    <div className="text-sm text-center font-bold truncate">
                      <ProductPrice price={item.price} plain />
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        disabled={item.quantity <= 1}
                        onClick={() => updateItem(item, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </Button>

                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        disabled={item.quantity >= item.countInStock}
                        onClick={() => updateItem(item, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0 text-red-500"
                        onClick={() => removeItem(item)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
