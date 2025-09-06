"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/actions/wishlist.actions";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface WishlistButtonProps {
  productId: string;
  initialWishlist: string[]; // Pass from parent to avoid extra fetch
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  initialWishlist,
}) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(
    initialWishlist?.includes(productId) || false
  );

  const [pending, startTransition] = useTransition();

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

    // Optimistic UI update
    setIsInWishlist(!isInWishlist);

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
        setIsInWishlist(isInWishlist); // Revert if error
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <Button
      onClick={toggleWishlist}
      className="flex items-center gap-1 w-full rounded-full cursor-pointer"
      variant="outline"
      disabled={pending}
    >
      <Heart
        size={10}
        className={`text-red-500 ${isInWishlist ? "fill-red-500" : ""}`}
      />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
};

export default WishlistButton;
