"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { AutoResizeTextarea } from "@/components/shared/textarea";
import { Button } from "@/components/ui/button";
import { replyToReview } from "@/lib/actions/review.actions";

export default function ReviewReplyForm({
  reviewId,
  initialReply,
}: {
  reviewId: string;
  initialReply?: { message?: string };
}) {
  const router = useRouter();
  const [message, setMessage] = useState(initialReply?.message || "");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const res = await replyToReview({ id: reviewId, message });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2 items-start">
      <AutoResizeTextarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Reply..."
        className="min-h-[36px] text-xs"
      />

      <Button
        size="icon"
        onClick={submit}
        disabled={isPending || !message.trim()}
      >
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  );
  }
