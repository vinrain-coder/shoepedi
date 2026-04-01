"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replySupportTicket } from "@/lib/actions/support.actions";

export default function ReplySupportForm({ id, existingReply }: { id: string; existingReply?: string }) {
  const [reply, setReply] = useState(existingReply || "");
  const [isPending, startTransition] = useTransition();

  const onSend = () => {
    startTransition(async () => {
      const response = await replySupportTicket({ id, reply });
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={3}
        placeholder="Reply to this customer"
      />
      <Button onClick={onSend} disabled={isPending || !reply.trim()} size="sm">
        Send reply email
      </Button>
    </div>
  );
}
