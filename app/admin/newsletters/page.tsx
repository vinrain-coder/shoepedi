import { Metadata } from "next";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllSubscribers, deleteSubscription, getNewsletterStats } from "@/lib/actions/newsletter.actions";
import { INewsletterSubscription } from "@/lib/db/models/newsletter-subscription.model";
import { formatDateTime, formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import { Badge } from "@/components/ui/badge";
import { Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import NewsletterStatsCards from "./newsletter-stats-cards";
import { NewslettersDateRangePicker } from "./date-range-picker";

export const metadata: Metadata = {
  title: "Admin Newsletter Subscribers",
};

export default async function AdminNewsletterSubscribers(props: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession();

  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const search = searchParams.search || "";
  const status = searchParams.status || "all";
  const from = searchParams.from;
  const to = searchParams.to;

  const [data, stats] = await Promise.all([
    getAllSubscribers({
      page,
      search,
      status,
      from,
      to,
    }),
    getNewsletterStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Newsletter</h1>
          <p className="text-muted-foreground">
            Manage your marketing audience and track subscriber growth
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/newsletters" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Filter by email..."
              defaultValue={search}
              className="pl-9"
            />
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
          </Form>
          <NewslettersDateRangePicker />
        </div>
      </div>

      <NewsletterStatsCards stats={stats} currentStatus={status} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Subscribed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length > 0 ? (
              data.data.map((sub: INewsletterSubscription) => (
                <TableRow key={sub._id.toString()}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(sub._id.toString())}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <Mail className="size-3 text-muted-foreground" />
                       {sub.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.status === "subscribed" ? "default" : "secondary"}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-xs">
                    <Badge variant="outline" className="font-normal">
                       {sub.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {sub.subscribedAt ? formatDateTime(sub.subscribedAt).dateTime : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteDialog id={sub._id.toString()} action={deleteSubscription} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No subscribers found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}
