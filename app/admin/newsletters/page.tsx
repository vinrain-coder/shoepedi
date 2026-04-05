import { Metadata } from "next";
import Link from "next/link";

import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllSubscribers, deleteSubscription } from "@/lib/actions/newsletter.actions";
import { INewsletterSubscription } from "@/lib/db/models/newsletter-subscription.model";
import { formatDateTime, formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin Newsletter Subscribers",
};

export default async function AdminNewsletterSubscribers(props: {
  searchParams: Promise<{ page: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession();

  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const { data: subscribers, totalPages } = await getAllSubscribers({
    page,
    search,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="h1-bold">Newsletter Subscribers</h1>
      </div>

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
            {subscribers?.map((sub: INewsletterSubscription) => (
              <TableRow key={sub._id.toString()}>
                <TableCell className="font-mono text-xs">
                  {formatId(sub._id.toString())}
                </TableCell>
                <TableCell className="font-medium">{sub.email}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === "subscribed" ? "default" : "secondary"}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{sub.source}</TableCell>
                <TableCell>
                  {sub.subscribedAt ? formatDateTime(sub.subscribedAt).dateTime : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteDialog id={sub._id.toString()} action={deleteSubscription} />
                </TableCell>
              </TableRow>
            ))}
            {subscribers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No subscribers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
}
