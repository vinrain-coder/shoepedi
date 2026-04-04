import { getServerSession } from "@/lib/get-session";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";
import { Metadata } from "next";
import { formatDateTime, formatId } from "@/lib/utils";
import ProductPrice from "@/components/shared/product/product-price";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins as CoinsIcon, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Breadcrumb from "@/components/shared/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Coins",
};

export default async function CoinsPage() {
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) return null;

  const user = await User.findById(session.user.id);

  // Fetch orders where coins were earned or redeemed
  const coinOrders = await Order.find({
    user: session.user.id,
    $or: [{ coinsEarned: { $gt: 0 } }, { coinsRedeemed: { $gt: 0 } }],
    isPaid: true
  }).sort({ createdAt: -1 }).lean();

  const history = coinOrders.flatMap((order: any) => {
    const events = [];
    if (order.coinsEarned > 0 && order.coinsCredited) {
      events.push({
        id: `${order._id.toString()}-earned`,
        type: 'earned',
        amount: order.coinsEarned,
        date: (order.paidAt || order.createdAt || new Date()).toISOString(),
        orderId: order._id.toString(),
        description: `Earned from Order ${formatId(order._id.toString())}`
      });
    }
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
          <CoinsIcon className="h-8 w-8 text-yellow-500" />
          My Coins
        </h1>
        <p className="text-muted-foreground">
          Track your rewards and see how you&apos;ve used your coins.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-900/50">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-yellow-500/10">
            <CoinsIcon className="h-12 w-12 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Current Balance</p>
            <h2 className="text-5xl font-extrabold text-slate-900 dark:text-slate-100">{user?.coins || 0}</h2>
            <p className="text-sm text-muted-foreground mt-1">1 coin = 1 Shilling</p>
          </div>
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
              <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-accent/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${event.type === 'earned' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {event.type === 'earned' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{event.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(new Date(event.date)).dateTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${event.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {event.type === 'earned' ? '+' : '-'}{event.amount}
                    </p>
                    <Link href={`/account/orders/${event.orderId}`} className="text-xs text-blue-600 hover:underline">View Order</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
