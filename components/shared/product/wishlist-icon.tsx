"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";

interface WishlistIconProps {
  productId: string;
  initialInWishlist?: boolean; // ✅ added optional prop
}

const WishlistIcon: React.FC<WishlistIconProps> = ({
  productId,
  initialInWishlist = false, // default to false
}) => {
  const { inWishlist, toggleWishlist, pending } = useWishlistToggle(
    productId,
    initialInWishlist // pass initial state to your hook
  );

  return (
    <button
      onClick={toggleWishlist}
      disabled={pending}
      className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition cursor-pointer"
      title="Add to Wishlist"
    >
      <Heart
        className={`transition ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-700"
        }`}
        size={16}
      />
    </button>
  );
};

export default WishlistIcon;
