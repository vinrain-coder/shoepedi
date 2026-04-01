import { Badge } from "@/components/ui/badge";
import { getSupportTicketsAdmin } from "@/lib/actions/support.actions";
import ReplySupportForm from "./reply-support-form";

export default async function AdminSupportPage() {
  const result = await getSupportTicketsAdmin();

  return (
    <div className="space-y-4 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-semibold">Support Inbox</h1>
        <p className="text-sm text-muted-foreground">Incoming customer complaints, queries, and recommendations.</p>
      </div>

      <div className="space-y-4">
        {result.data.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">No incoming support tickets.</div>
        ) : (
          result.data.map((ticket) => (
            <div key={ticket._id} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.name} · {ticket.email} · {ticket.type}
                  </p>
                </div>
                <Badge variant={ticket.status === "replied" ? "default" : "secondary"}>{ticket.status}</Badge>
              </div>
              <p className="text-sm">{ticket.message}</p>
              <ReplySupportForm id={ticket._id.toString()} existingReply={ticket.adminReply} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
