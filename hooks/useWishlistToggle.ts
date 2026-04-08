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

export function useWishlistToggle(
  productId: string,
  initialInWishlist = false
) {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { isInWishlist, addProductById, removeProduct } = useWishlistStore();
  const inWishlist = isInWishlist(productId) || initialInWishlist;

  const toggleWishlist = () => {
    if (!session) {
      toast.error("You need to sign in to use the wishlist", {
        action: { label: "Sign in", onClick: () => router.push("/sign-in") },
      });
      return;
    }

    if (inWishlist) removeProduct(productId);
    else addProductById(productId);

    startTransition(async () => {
      try {
        if (inWishlist) {
          await removeFromWishlist(productId);
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(productId);
          toast.success("Added to wishlist♥️");
        }
      } catch {
        // revert if API fails
        if (inWishlist) {
          addProductById(productId);
        } else {
          removeProduct(productId);
        }
        toast.error("Something went wrong!");
      }
    });
  };

  return { inWishlist, toggleWishlist, pending };
}
