import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Undo2, Wallet, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { cn, formatDateTime } from "@/lib/utils";
import CoinAdjustDialog from "../coin-adjust-dialog";

const formatCoinAmount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

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

  const statCards = [
    {
      label: "Current Balance",
      value: formatCoinAmount(data.user.coins),
      icon: Wallet,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      label: "Total Events",
      value: data.totalEvents,
      icon: ArrowLeftRight,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      label: "History Scope",
      value: "Full",
      icon: Undo2,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex text-sm text-muted-foreground">
          <Link href="/admin/coins" className="hover:underline">
            Coins
          </Link>
          <span className="mx-1">›</span>
          <span className="text-foreground">{data.user.name}</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="h1-bold text-3xl tracking-tight">Coin History</h1>
            <p className="text-muted-foreground">
              {data.user.name} ({data.user.email})
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/coins">Back to List</Link>
            </Button>
            <CoinAdjustDialog userId={id} currentCoins={data.user.coins} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-dashed shadow-none"
            >
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <div className={cn("rounded-full p-2 mb-2", stat.color)}>
                  <Icon className="size-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                  {stat.label}
                </span>
                <span className="text-xl font-bold leading-tight">
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Transaction Logs</h2>
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
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDateTime(event.date).dateTime}
                      </TableCell>
                      <TableCell className="capitalize text-xs">
                        {String(event.type).replaceAll("_", " ")}
                      </TableCell>
                      <TableCell className={cn(
                        "font-medium",
                        isNegative ? "text-destructive" : "text-emerald-600"
                      )}>
                        {isNegative ? "-" : "+"}
                        {formatCoinAmount(event.amount)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {event.reason}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {event.orderId ? (
                          <Link href={`/admin/orders/${event.orderId}`} className="underline hover:text-primary">
                            View Order
                          </Link>
                        ) : event.admin ? (
                          <span>By {event.admin.name || event.admin.email}</span>
                        ) : event.balanceAfter !== undefined ? (
                          <span>
                            {formatCoinAmount(event.balanceBefore ?? 0)} → {formatCoinAmount(event.balanceAfter ?? 0)}
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
      </div>

      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={String(currentPage)} totalPages={data.totalPages} />
        </div>
      )}
    </main>
  );
}
