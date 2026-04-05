"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { notifySubscribers } from "@/lib/actions/stock.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export default function NotifyButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleNotify = () => {
    startTransition(async () => {
      try {
        const res = await notifySubscribers(productId);
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
      size="sm"
      variant="outline"
      onClick={handleNotify}
      disabled={isPending}
      className="cursor-pointer"
    >
      <Bell className="mr-2 h-4 w-4" />
      {isPending ? "Notifying..." : "Notify"}
    </Button>
  );
}
