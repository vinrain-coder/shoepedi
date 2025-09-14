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
      toast.error("You need to log in to access your wishlist", {
        action: { label: "Sign in", onClick: () => router.push("/sign-in") },
      });
      return;
    }

    router.push("/wishlist");
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center gap-1 p-2 cursor-pointer"
    >
      <Heart className="w-6 h-6 text-white" />
      <span
        className="
          absolute -top-0 -right-0.5
          flex min-h-[18px] min-w-[18px]
          items-center justify-center
          rounded-full bg-red-500 px-1
          text-[10px] leading-none text-white font-semibold
        "
      >
        {count}
      </span>
    </button>
  );
}
