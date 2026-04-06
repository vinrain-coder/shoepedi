import { Badge } from "@/components/ui/badge";
import { getSupportTicketsAdmin, getSupportStats } from "@/lib/actions/support.actions";
import ReplySupportForm from "./reply-support-form";
import SupportStatsCards from "./support-stats-cards";
import { SupportDateRangePicker } from "./date-range-picker";
import { Search, Mail, User, Tag, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import Pagination from "@/components/shared/pagination";
import { formatDateTime } from "@/lib/utils";

export default async function AdminSupportPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const {
    query = "",
    status = "all",
    from,
    to
  } = searchParams;

  const [result, stats] = await Promise.all([
    getSupportTicketsAdmin({
      page: Number(page),
      query,
      status,
      from,
      to,
    }),
    getSupportStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Support Inbox</h1>
          <p className="text-muted-foreground">
            Manage customer complaints, queries, and recommendations
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/support" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search tickets..."
              defaultValue={query}
              className="pl-9"
            />
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
          </Form>
          <SupportDateRangePicker />
        </div>
      </div>

      <SupportStatsCards stats={stats} currentStatus={status} />

      <div className="space-y-4">
        {result.data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
             <Mail className="mx-auto size-8 text-muted-foreground mb-4 opacity-20" />
             <p className="text-sm text-muted-foreground">No support tickets found matching the criteria.</p>
          </div>
        ) : (
          result.data.map((ticket) => (
            <div key={ticket._id} className="rounded-lg border bg-card p-5 space-y-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{ticket.subject}</h3>
                    <Badge variant={ticket.status === "replied" ? "default" : "secondary"} className="capitalize">
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize bg-muted/50">
                      {ticket.type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" /> {ticket.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {ticket.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {formatDateTime(new Date(ticket.createdAt)).dateTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-md p-4 text-sm leading-relaxed italic border-l-2 border-primary/20">
                "{ticket.message}"
              </div>

              <div className="pt-2 border-t">
                 <ReplySupportForm id={ticket._id.toString()} existingReply={ticket.adminReply} />
              </div>
            </div>
          ))
        )}
      </div>

      {result.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={result.totalPages} />
        </div>
      )}
    </div>
  );
}
