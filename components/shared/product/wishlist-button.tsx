"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/actions/wishlist.actions";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/hooks/useWishlistStore";

interface WishlistButtonProps {
  productId: string; // ✅ only need the ID
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { isInWishlist, addProduct, removeProduct } = useWishlistStore();

  const inWishlist = isInWishlist(productId); // ✅ fixed

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

    startTransition(async () => {
      try {
        if (inWishlist) {
          await removeFromWishlist(productId);
          removeProduct(productId);
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(productId);
          // if you need product details for addProduct, pass them in from parent
          addProduct({ _id: productId } as any);
          toast.success("Added to wishlist");
        }
      } catch {
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <Button
      onClick={toggleWishlist}
      className="flex items-center gap-2 w-full rounded-full"
      variant="outline"
      disabled={pending}
    >
      <Heart
        size={18}
        className={`transition ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"
        }`}
      />
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
};

export default WishlistButton;
