"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/actions/wishlist.actions";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { getProductById } from "@/lib/actions/product.actions";

export function useWishlistToggle(productId: string, initialInWishlist: boolean) {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { isInWishlist, addProduct, removeProduct } = useWishlistStore();
  const inWishlist = isInWishlist(productId);

  const toggleWishlist = () => {
    if (!session) {
      toast.error("You need to log in to use the wishlist", {
        action: { label: "Sign in", onClick: () => router.push("/sign-in") },
      });
      return;
    }

    if (inWishlist) {
      removeProduct(productId);
    }

    startTransition(async () => {
      try {
        if (inWishlist) {
          await removeFromWishlist(productId);
          toast.success("Removed from wishlist");
        } else {
          const product = await getProductById(productId);
          if (product) addProduct(product);
          await addToWishlist(productId);
          toast.success("Added to wishlist");
        }
      } catch {
        // revert if API fails
        if (inWishlist) {
          const product = await getProductById(productId);
          if (product) addProduct(product);
        } else {
          removeProduct(productId);
        }
        toast.error("Something went wrong!");
      }
    });
  };

  return { inWishlist, toggleWishlist, pending };
}
