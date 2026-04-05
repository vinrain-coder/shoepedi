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

  return (
    <Link href="/cart" className="header-button relative">
      <ShoppingCartIcon className="h-6 w-6" />

      {isMounted && (
        <span className="header-badge">
          {cartItemsCount}
        </span>
      )}

      {showSidebar && (
        <div className="absolute top-[20px] right-[-16px] rotate-[-90deg] z-10 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[8px] border-transparent border-b-background"></div>
      )}
    </Link>
  );
}
