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

  const toggleWishlist = () => {
    if (!session) {
      toast.error("You need to log in to use the wishlist", {
        action: {
          label: "Sign-in",
          onClick: () => router.push("/sign-in"),
        },
      });
      return;
    }

    setIsInWishlist(!isInWishlist); // Optimistic update

    startTransition(async () => {
      try {
        if (isInWishlist) {
          await removeFromWishlist(productId);
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(productId);
          toast.success("Added to wishlist");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setIsInWishlist(isInWishlist); // Revert UI if error occurs
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={pending}
      className="p-2 cursor-pointer"
    >
      <Heart
        className={`w-6 h-6 transition ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-500"}`}
      />
    </button>
  );
};

export default WishlistIcon;
