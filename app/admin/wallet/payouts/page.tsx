import { Metadata } from "next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getAllWalletPayouts } from "@/lib/actions/wallet.actions";
import { getServerSession } from "@/lib/get-session";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { PayoutStatusActions } from "./payout-status-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Wallet Payout Requests",
};

export default async function AdminWalletPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const { page = "1", q = "", status = "all" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const payoutsData = await getAllWalletPayouts({
    page: currentPage,
    query: q,
    status: status,
  });

  const { data: payouts = [], totalPages = 1 } = payoutsData as { data: any[], totalPages: number };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Payout Requests</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <form method="GET" className="flex flex-1 flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search by user name or email..."
                defaultValue={q}
                className="pl-10"
              />
            </div>

            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Preserve page if searching, though often searching should reset to page 1 */}
            <input type="hidden" name="page" value="1" />

            <button type="submit" className="hidden">Search</button>
          </form>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length > 0 ? (
              payouts.map((payout: any) => (
                <TableRow key={payout._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{payout.user?.name}</span>
                      <span className="text-xs text-muted-foreground">{payout.user?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(payout.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{payout.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {payout.paymentDetails?.recipient}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payout.status === "paid"
                          ? "default"
                          : payout.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDateTime(payout.createdAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <PayoutStatusActions payout={payout} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No payout requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination page={String(currentPage)} totalPages={totalPages} />
      )}
    </div>
  );
}
