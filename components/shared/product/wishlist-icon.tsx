"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";

interface WishlistIconProps {
  productId: string;
}

const WishlistIcon: React.FC<WishlistIconProps> = ({ productId }) => {
  const { inWishlist, toggleWishlist, pending } = useWishlistToggle(productId);

  return (
    <Button
      onClick={toggleWishlist}
      disabled={pending}
      className="p-0.5 rounded-full bg-white shadow hover:bg-gray-100 transition"
    >
      <Heart
        className={`w-6 h-6 transition ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`}
      />
    </Button>
  );
};

export default WishlistIcon;
