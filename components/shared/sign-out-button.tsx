"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { toSignInPath } from "@/lib/redirects";
import { LogOut } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SignOutButton = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const protectedPrefixes = ["/account", "/admin", "/checkout", "/wishlist"];
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const shouldGoToSignIn = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const callbackURL = shouldGoToSignIn ? toSignInPath(currentPath) : currentPath;

  async function handleClick() {
    await signOut({
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("You’ve logged out. See you soon!");
          router.replace(callbackURL);
        },
      },
    });
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full"
      variant="outline"
      disabled={isPending}
    >
      <LogOut className="text-white" />
      Sign out
    </Button>
  );
};
