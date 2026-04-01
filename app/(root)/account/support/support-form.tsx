"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupportTicket } from "@/lib/actions/support.actions";

export default function SupportForm({
  initialName,
  initialEmail,
}: {
  initialName?: string;
  initialEmail?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"complaint" | "query" | "recommendation">("query");

  const onSubmit = () => {
    startTransition(async () => {
      const response = await createSupportTicket({ name, email, subject, message, type });
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      setSubject("");
      setMessage("");
      setType("query");
      toast.success(response.message);
    });
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-base font-semibold">Contact Support</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" />
      </div>
      <select
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={type}
        onChange={(e) => setType(e.target.value as "complaint" | "query" | "recommendation")}
      >
        <option value="query">Query</option>
        <option value="complaint">Complaint</option>
        <option value="recommendation">Recommendation</option>
      </select>
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more" rows={5} />
      <Button onClick={onSubmit} disabled={isPending}>Submit support request</Button>
    </div>
  );
}
