import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";

import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import WalletTransaction, { IWalletTransaction } from "@/lib/db/models/wallet-transaction.model";
import { Metadata } from "next";
import { formatDateTime, formatNumberWithTwoDecimals } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/components/shared/breadcrumb";
import Link from "next/link";
import Pagination from "@/components/shared/pagination";
import { getSetting } from "@/lib/actions/setting.actions";
import { WalletTopupDialog } from "./wallet-topup-dialog";
import { WalletPayoutDialog } from "./wallet-payout-dialog";
import Script from "next/script";

export const metadata: Metadata = {
  title: "My Wallet",
};

export default async function WalletPage({
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

  const user = await User.findById(session.user.id).select("walletBalance").lean();

  // Fetch all wallet transactions with DB-side pagination
  const totalCount = await WalletTransaction.countDocuments({ user: session.user.id });
  const skipAmount = (pageNum - 1) * pageSize;

  const transactions = await WalletTransaction.find({ user: session.user.id })
    .populate({
        path: "order",
        select: "_id trackingNumber"
    })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(pageSize)
    .lean() as unknown as (IWalletTransaction & { order?: { _id: string; trackingNumber: string } })[];

  const history = transactions.map((tx) => ({
    id: tx._id.toString(),
    date: tx.createdAt ? tx.createdAt.toISOString() : new Date().toISOString(),
    type: tx.source === "refund" || tx.source === "deposit" || (tx.source === "admin_adjustment" && tx.amount >= 0) ? 'earned' : 'redeemed',
    amount: Math.abs(tx.amount || 0),
    orderId: tx.order?._id?.toString(),
    description: tx.reason
  }));

  return (
    <div className="space-y-6">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <Breadcrumb />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="h1-bold text-3xl flex items-center gap-2">
            <WalletIcon className="h-8 w-8 text-primary" />
            My Wallet
          </h1>
          <p className="text-muted-foreground">
            View your refund balance and transaction history.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <WalletPayoutDialog currentBalance={user?.walletBalance || 0} />
            <WalletTopupDialog />
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <WalletIcon className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Current Balance</p>
            <h2 className="text-5xl font-extrabold text-foreground">KES {formatNumberWithTwoDecimals(user?.walletBalance || 0)}</h2>
            <p className="text-sm text-muted-foreground mt-1">Available for future purchases</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold">Transaction History</h2>
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Your wallet history is empty.
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
                    {event.orderId && <Link href={`/account/orders/${event.orderId}`} className="text-xs text-blue-600 hover:underline">View Order</Link>}
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
