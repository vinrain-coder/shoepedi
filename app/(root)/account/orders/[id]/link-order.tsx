"use client";

import { useEffect } from "react";
import { convertGuestToUser } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LinkOrderHandler({
  orderId,
  accessToken
}: {
  orderId: string;
  accessToken: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleLink = async () => {
      const result = await convertGuestToUser(orderId, accessToken);
      if (result.success) {
        toast.success(result.message);
        router.replace(`/account/orders/${orderId}`);
        router.refresh();
      }
    };
    handleLink();
  }, [orderId, accessToken, router]);

  return null;
}
