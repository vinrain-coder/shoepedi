"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareReply, SendHorizonal } from "lucide-react";
import { toast } from "sonner";

import { AutoResizeTextarea } from "@/components/shared/textarea";
import { Button } from "@/components/ui/button";
import { replyToReview } from "@/lib/actions/review.actions";

export default function ReviewReplyForm({
  reviewId,
  initialReply,
}: {
  reviewId: string;
  initialReply?: {
    message?: string;
  };
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
    <div className="min-w-72 space-y-3 rounded-2xl border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquareReply className="size-4 text-primary" />
        Admin reply
      </div>
      <AutoResizeTextarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Reply to this review..."
        className="min-h-24 rounded-xl bg-background"
      />
      <Button
        type="button"
        size="sm"
        className="w-full rounded-full"
        onClick={submit}
        disabled={isPending || !message.trim()}
      >
        <SendHorizonal className="size-4" />
        {isPending ? "Saving..." : initialReply?.message ? "Update reply" : "Publish reply"}
      </Button>
    </div>
  );
}
