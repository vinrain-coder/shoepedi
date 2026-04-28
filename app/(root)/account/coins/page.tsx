import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";

import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";

import { Metadata } from "next";
import Link from "next/link";

import {
  formatDateTime,
  formatId,
  formatNumberWithTwoDecimals,
  cn,
} from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/shared/pagination";
import Breadcrumb from "@/components/shared/breadcrumb";

import {
  Coins as CoinsIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
} from "lucide-react";

import { getSetting } from "@/lib/actions/setting.actions";

export const metadata: Metadata = {
  title: "My Coins",
};

export default async function CoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  await connectToDatabase();

  const session = await getServerSession();
  if (!session?.user) redirect(toSignInPath());

  const {
    common: { pageSize },
    site,
  } = await getSetting();

  const user = await User.findById(session.user.id);

  const query = {
    user: session.user.id,
    $or: [{ coinsEarned: { $gt: 0 } }, { coinsRedeemed: { $gt: 0 } }],
  };

  const totalCount = await Order.countDocuments(query);
  const skipAmount = (pageNum - 1) * pageSize;

  const coinOrders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(pageSize)
    .lean();

  const history = coinOrders
    .flatMap((order: any) => {
      const events = [];

      if (
        order.coinsEarned > 0 &&
        order.coinsCredited &&
        !["cancelled", "returned"].includes(order.status)
      ) {
        events.push({
          id: `${order._id}-earned`,
          type: "earned",
          amount: order.coinsEarned,
          date: (order.paidAt || order.createdAt).toISOString(),
          orderId: order._id.toString(),
          description: `Earned from Order ${formatId(order._id.toString())}`,
        });
      }

      if (order.coinsRedeemed > 0) {
        events.push({
          id: `${order._id}-redeemed`,
          type: "redeemed",
          amount: order.coinsRedeemed,
          date: order.createdAt.toISOString(),
          orderId: order._id.toString(),
          description: `Redeemed for Order ${formatId(order._id.toString())}`,
        });
      }

      return events;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <Breadcrumb />

      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CoinsIcon className="h-7 w-7 text-primary" />
          My Coins
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your rewards and spending history
        </p>
      </div>

      {/* BALANCE CARD */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-8 text-center space-y-2">
          <CoinsIcon className="h-10 w-10 mx-auto text-primary animate-pulse" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Current Balance
          </p>
          <h2 className="text-4xl font-extrabold">
            {formatNumberWithTwoDecimals(user?.coins || 0)}
          </h2>
          <p className="text-xs text-muted-foreground">1 coin = 1 Shilling</p>
          <p className="text-[11px] text-muted-foreground italic">
            Coins can only be used on {site.name}
          </p>
        </CardContent>
      </Card>

      {/* HISTORY TABLE */}
      <div id="coins-history" className="space-y-4">
        <h2 className="text-xl font-bold">Transaction History</h2>

        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No coin activity yet. Start shopping to earn rewards.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {history.map((event) => (
                  <tr
                    key={event.id}
                    className="border-t hover:bg-muted/40 transition"
                  >
                    {/* TYPE */}
                    <td className="p-3">
                      <Badge
                        variant={
                          event.type === "earned" ? "success" : "destructive"
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {event.type === "earned" ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                        {event.type}
                      </Badge>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="p-3 font-medium">{event.description}</td>

                    {/* DATE */}
                    <td className="p-3 text-muted-foreground">
                      {formatDateTime(new Date(event.date)).dateTime}
                    </td>

                    {/* AMOUNT */}
                    <td
                      className={cn(
                        "p-3 text-right font-bold",
                        event.type === "earned"
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {event.type === "earned" ? "+" : "-"}
                      {formatNumberWithTwoDecimals(event.amount)}
                    </td>

                    {/* ACTION */}
                    <td className="p-3 text-right">
                      <Link
                        href={`/account/orders/${event.orderId}#coins-history`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalCount > pageSize && (
          <div className="flex justify-center pt-4">
            <Pagination
              page={pageNum}
              totalPages={Math.ceil(totalCount / pageSize)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
