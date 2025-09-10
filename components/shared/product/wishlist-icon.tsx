"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/actions/wishlist.actions";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { getProductById } from "@/lib/actions/product.actions";
import { Button } from "@/components/ui/button";

interface WishlistIconProps {
  productId: string;
}

const WishlistIcon: React.FC<WishlistIconProps> = ({ productId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { isInWishlist, addProduct, removeProduct } = useWishlistStore();
  const inWishlist = isInWishlist(productId);

  const toggleWishlist = () => {
    if (!session) {
      toast.error("You need to log in to use the wishlist", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/sign-in"),
        },
      });
      return;
    }

    // optimistic update
    if (inWishlist) {
      removeProduct(productId);
    } else {
      addProduct({ _id: productId } as any); // temp until fetch completes
    }

    startTransition(async () => {
      try {
        if (inWishlist) {
          await removeFromWishlist(productId);
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(productId);
          const product = await getProductById(productId);
          if (product) addProduct(product); // replace temp
          toast.success("Added to wishlist");
        }
      } catch {
        // revert if API fails
        if (inWishlist) {
          addProduct({ _id: productId } as any);
        } else {
          removeProduct(productId);
        }
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <Button
      onClick={toggleWishlist}
      disabled={pending}
      className="p-0.5 rounded-full bg-white shadow hover:bg-gray-100 transition"
    >
      <Heart
        className={`w-6 h-6 transition ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-700"
        }`}
      />
    </Button>
  );
};

export default WishlistIcon;
