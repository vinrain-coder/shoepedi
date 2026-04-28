"use client";

import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import useIsMounted from "@/hooks/use-is-mounted";
import useShowSidebar from "@/hooks/use-cart-sidebar";
import { cn } from "@/lib/utils";
import useCartStore from "@/hooks/use-cart-store";

export default function CartButton() {
  const isMounted = useIsMounted();
  const {
    cart: { items },
  } = useCartStore();

  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0);

  const showSidebar = useShowSidebar();

  const badgeSize = cartItemsCount >= 10 && "text-sm px-0 p-px";

  return (
    <Link
      href="/cart"
      className="px-1 header-button relative group"
      aria-label={`Shopping cart, ${cartItemsCount} items`}
      title={`Cart (${cartItemsCount})`}
    >
      <div className="flex items-end text-xs relative">
        <ShoppingCartIcon
          className="h-8 w-8 cursor-pointer"
          aria-hidden="true"
        />

        <span className="sr-only">
          Shopping cart with {cartItemsCount} items
        </span>

        {isMounted && (
          <span
            className={cn(
              "bg-black px-1 rounded-full text-primary text-base font-bold absolute left-2.5 -top-1 z-10",
              badgeSize,
            )}
            aria-hidden="true"
          >
            {cartItemsCount}
          </span>
        )}

        {/* Styled Tooltip */}
        <span
          className="
            absolute top-full mt-5.5 left-1/2 -translate-x-1/2
            whitespace-nowrap rounded-md bg-black py-1
            text-xs text-white opacity-0
            transition-opacity duration-200
            group-hover:opacity-100
            pointer-events-none z-50
          "
        >
          Cart ({cartItemsCount})
        </span>

        {showSidebar && (
          <div
            className="
              absolute top-5 -right-4 -rotate-90 z-10
              w-0 h-0 border-l-[7px] border-r-[7px]
              border-b-8 border-transparent border-b-background
            "
            aria-hidden="true"
          />
        )}
      </div>
    </Link>
  );
}
