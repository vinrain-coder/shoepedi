"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { notifySubscribers } from "@/lib/actions/stock.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export default function NotifyButton({
  productId,
  subscriptionId,
  variant = "outline",
  size = "sm",
  label = "Notify"
}: {
  productId?: string;
  subscriptionId?: string;
  variant?: "outline" | "default" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleNotify = () => {
    if (!productId && !subscriptionId) {
      toast.error("Product ID or Subscription ID is required.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await notifySubscribers({ productId, subscriptionId });
        if (res.success) {
          toast.success(res.message);
          router.refresh();
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.error("Failed to notify subscribers:", error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleNotify}
      disabled={isPending}
      className="cursor-pointer"
    >
      <Bell className="mr-2 h-4 w-4" />
      {isPending ? "Notifying..." : label}
    </Button>
  );
}
