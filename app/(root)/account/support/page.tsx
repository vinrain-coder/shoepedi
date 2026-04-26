import { Badge } from "@/components/ui/badge";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";

import { getMySupportTickets } from "@/lib/actions/support.actions";
import SupportTicketForm from "@/components/shared/support/support-ticket-form";
import Breadcrumb from "@/components/shared/breadcrumb";

export default async function AccountSupportPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(toSignInPath());
  }

  const tickets = await getMySupportTickets();

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div>
        <h1 className="text-2xl font-semibold">Customer Support</h1>
        <p className="text-sm text-muted-foreground">Submit complaints, queries, or recommendations and track replies.</p>
      </div>

      <SupportTicketForm initialName={session?.user?.name || ""} initialEmail={session?.user?.email || ""} />

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3 font-medium">Your requests</div>
        <div className="divide-y">
          {tickets.data.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No support requests yet.</p>
          ) : (
            tickets.data.map((ticket) => (
              <div key={ticket._id} className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{ticket.subject}</p>
                  <Badge variant={ticket.status === "replied" ? "success" : "secondary"}>{ticket.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="text-sm">{ticket.message}</p>
                {ticket.adminReply ? (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium">Admin reply</p>
                    <p>{ticket.adminReply}</p>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
