"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/actions/wishlist.actions";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { getProductById } from "@/lib/actions/product.actions"; // helper fetch
import { Button } from "@/components/ui/button";

interface WishlistIconProps {
  productId: string;
  initialInWishlist: boolean;
}

const WishlistIcon: React.FC<WishlistIconProps> = ({
  productId,
  initialInWishlist,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();

  const { addProduct, removeProduct } = useWishlistStore();

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

    const prevState = isInWishlist;
    setIsInWishlist(!prevState);

    startTransition(async () => {
      try {
        if (prevState) {
          await removeFromWishlist(productId);
          removeProduct(productId); // ✅ sync store
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(productId);
          const product = await getProductById(productId);
          if (product) addProduct(product); // ✅ sync store
          toast.success("Added to wishlist");
        }
      } catch (error) {
        setIsInWishlist(prevState);
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
          isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700"
        }`}
      />
    </Button>
  );
};

export default WishlistIcon;
