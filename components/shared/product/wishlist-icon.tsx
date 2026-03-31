"use client";

import { Heart } from "lucide-react";
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
      className={`p-1.5 rounded-full shadow-lg transition cursor-pointer ${
        inWishlist
          ? "bg-rose-500/10 hover:bg-rose-500/20"
          : "bg-white hover:bg-gray-100"
      }`}
      title="Add to Wishlist"
    >
      <Heart
        className={`transition ${
          inWishlist ? "fill-rose-500 text-rose-500" : "text-gray-700"
        }`}
        size={16}
      />
    </button>
  );
};

export default WishlistIcon;
