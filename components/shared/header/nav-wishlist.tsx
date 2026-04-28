"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { getWishlistCount } from "@/lib/actions/wishlist.actions";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/hooks/useWishlistStore";

export default function NavbarWishlist() {
  const { data: session } = useSession();
  const { count, setCount } = useWishlistStore();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const wishlistCount = await getWishlistCount();
        setCount(wishlistCount);
      } catch {
        setCount(0);
      }
    };

    fetchCount();
  }, [session, setCount]);

  const handleClick = () => {
    if (!session) {
      toast.error("You need sign in to access your wishlist", {
        action: { label: "Sign in", onClick: () => router.push("/sign-in") },
      });
      return;
    }

    router.push("/account/wishlist");
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center gap-1 p-2 cursor-pointer group"
    >
      <Heart className="w-6 h-6 text-white" />

      <span className="sr-only">Wishlist with {count} items</span>

      <span
        className="
      absolute top-full mt-3.5 left-1/2 -translate-x-1/2
      whitespace-nowrap rounded-md bg-black px-2 py-1
      text-xs text-white opacity-0
      transition-opacity duration-200
      group-hover:opacity-100
      pointer-events-none
    "
      >
        Wishlist ({count})
      </span>

      <span
        className="
      absolute top-0 -right-0.5
      flex min-h-4.5 min-w-4.5
      items-center justify-center
      rounded-full bg-red-500
      text-[10px] leading-none text-white font-semibold
    "
        aria-hidden="true"
      >
        {count}
      </span>
    </button>
  );
}
