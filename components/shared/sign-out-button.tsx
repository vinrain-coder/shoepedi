"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const SignOutButton = () => {
  const [isPending, setIsPending] = useState(false);

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
