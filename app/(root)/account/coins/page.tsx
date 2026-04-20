import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";

import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";
import { Metadata } from "next";
import { formatDateTime, formatId, formatNumberWithTwoDecimals } from "@/lib/utils";
import ProductPrice from "@/components/shared/product/product-price";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins as CoinsIcon, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/components/shared/breadcrumb";
import Link from "next/link";
import Pagination from "@/components/shared/pagination";
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
  const pageNum = Math.max(1, Math.floor(parseInt(page, 10) || 1));

  await connectToDatabase();
  const session = await getServerSession();
  if (!session?.user) {
    redirect(toSignInPath());
  }

  const {
    common: { pageSize },
  } = await getSetting();

  const user = await User.findById(session.user.id);

  // Fetch orders where coins were earned or redeemed
  const query = {
    user: session.user.id,
    $or: [
      { coinsEarned: { $gt: 0 } },
      { coinsRedeemed: { $gt: 0 } }
    ],
  };

  const totalCount = await Order.countDocuments(query);
  const skipAmount = (pageNum - 1) * pageSize;

  const coinOrders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(pageSize)
    .lean();

  const history = coinOrders.flatMap((order: any) => {
    const events = [];

    // Original earnings
    if (order.coinsEarned > 0 && order.coinsCredited && !["cancelled", "returned"].includes(order.status)) {
      events.push({
        id: `${order._id.toString()}-earned`,
        type: 'earned',
        amount: order.coinsEarned,
        date: (order.paidAt || order.createdAt || new Date()).toISOString(),
        orderId: order._id.toString(),
        description: `Earned from Order ${formatId(order._id.toString())}`
      });
    }

    // Redemptions
    if (order.coinsRedeemed > 0) {
      events.push({
        id: `${order._id.toString()}-redeemed`,
        type: 'redeemed',
        amount: order.coinsRedeemed,
        date: (order.createdAt || new Date()).toISOString(),
        orderId: order._id.toString(),
        description: `Redeemed for Order ${formatId(order._id.toString())}`
      });
    }


    return events;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="flex flex-col gap-2">
        <h1 className="h1-bold text-3xl flex items-center gap-2">
          <CoinsIcon className="h-8 w-8 text-primary" />
          My Coins
        </h1>
        <p className="text-muted-foreground">
          Track your rewards and see how you&apos;ve used your coins.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 background border-primary/20">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <CoinsIcon className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Current Balance</p>
            <h2 className="text-5xl font-extrabold text-foreground">{formatNumberWithTwoDecimals(user?.coins || 0)}</h2>
            <p className="text-sm text-muted-foreground mt-1">1 coin = 1 Shilling</p>
          </div>
          <p className="text-xs text-muted-foreground italic mt-2">
            Coins are loyalty rewards and can only be used to pay for orders on ShoePedi.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold">Transaction History</h2>
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              You haven&apos;t earned or redeemed any coins yet. Start shopping to earn rewards!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((event) => (
              <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${event.type === 'earned' ? 'badge-success' : 'badge-rejected'}`}>
                      {event.type === 'earned' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{event.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(new Date(event.date)).dateTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold flex items-center justify-end gap-1 ${event.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.type === 'earned' && <CheckCircle2 className="h-4 w-4" />}
                      {event.type === 'earned' ? '+' : '-'}{formatNumberWithTwoDecimals(event.amount)}
                    </p>
                    <Link href={`/account/orders/${event.orderId}`} className="text-xs text-blue-600 hover:underline">View Order</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
