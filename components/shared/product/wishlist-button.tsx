"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";

interface WishlistButtonProps {
  productId: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId }) => {
  const { inWishlist, toggleWishlist, pending } = useWishlistToggle(productId);

  return (
    <Button
      onClick={toggleWishlist}
      className="flex items-center gap-2 w-full rounded-full"
      variant="outline"
      disabled={pending}
    >
      <Heart
        size={24}
        className={`transition ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"
        }`}
      />
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
};

export default WishlistButton;
