import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Undo2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getUserCoinHistoryAdmin } from "@/lib/actions/coin.actions";
import { getServerSession } from "@/lib/get-session";
import { formatDateTime } from "@/lib/utils";
import CoinAdjustDialog from "../coin-adjust-dialog";

export const metadata: Metadata = {
  title: "User Coin History",
};

export default async function AdminUserCoinHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const { id } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const data = await getUserCoinHistoryAdmin({
    userId: id,
    page: currentPage,
  });
  const events = data.history as Array<{
    id: string;
    date: Date;
    type: string;
    amount: number;
    reason: string;
    orderId?: string;
    admin?: { name?: string; email?: string } | null;
    balanceBefore?: number;
    balanceAfter?: number;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coin History</h1>
          <p className="text-muted-foreground">
            {data.user.name} ({data.user.email})
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/coins">Back to Coin List</Link>
          </Button>
          <CoinAdjustDialog userId={id} currentCoins={data.user.coins} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold">
            <Wallet className="size-5 text-muted-foreground" />
            {data.user.coins.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold">
            <ArrowLeftRight className="size-5 text-muted-foreground" />
            {data.totalEvents}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">History Scope</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Undo2 className="size-5" />
            Includes order-based and admin adjustment events.
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => {
                const isNegative = ["redeemed", "adjustment_deduct"].includes(event.type);
                return (
                  <TableRow key={event.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(event.date).dateTime}
                    </TableCell>
                    <TableCell className="capitalize">{String(event.type).replaceAll("_", " ")}</TableCell>
                    <TableCell className={isNegative ? "text-destructive font-medium" : "text-emerald-600 font-medium"}>
                      {isNegative ? "-" : "+"}
                      {event.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{event.reason}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.orderId ? (
                        <Link href={`/admin/orders/${event.orderId}`} className="underline">
                          View Order
                        </Link>
                      ) : event.admin ? (
                        <span>By {event.admin.name || event.admin.email}</span>
                      ) : event.balanceAfter !== undefined ? (
                        <span>
                          {(event.balanceBefore ?? 0).toFixed(2)} → {(event.balanceAfter ?? 0).toFixed(2)}
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No coin history found for this user.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && <Pagination page={String(currentPage)} totalPages={data.totalPages} />}
    </div>
  );
}
