import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";

import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import WalletTransaction, {
  IWalletTransaction,
} from "@/lib/db/models/wallet-transaction.model";

import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

import { formatDateTime, formatNumberWithTwoDecimals, cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/shared/pagination";
import Breadcrumb from "@/components/shared/breadcrumb";

import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

import { WalletTopupDialog } from "./wallet-topup-dialog";
import { WalletPayoutDialog } from "./wallet-payout-dialog";
import { getSetting } from "@/lib/actions/setting.actions";

export const metadata: Metadata = {
  title: "My Wallet",
};

export default async function WalletPage({
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
  } = await getSetting();

  const user = await User.findById(session.user.id)
    .select("walletBalance")
    .lean();

  const totalCount = await WalletTransaction.countDocuments({
    user: session.user.id,
  });

  const skipAmount = (pageNum - 1) * pageSize;

  const transactions = (await WalletTransaction.find({
    user: session.user.id,
  })
    .populate({
      path: "order",
      select: "_id trackingNumber",
    })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(pageSize)
    .lean()) as unknown as (IWalletTransaction & {
    order?: { _id: string; trackingNumber: string };
  })[];

  const history = transactions.map((tx) => ({
    id: tx._id.toString(),
    date: tx.createdAt?.toISOString() || new Date().toISOString(),
    type:
      tx.source === "refund" ||
      tx.source === "deposit" ||
      (tx.source === "admin_adjustment" && tx.amount >= 0)
        ? "earned"
        : "redeemed",
    amount: Math.abs(tx.amount || 0),
    orderId: tx.order?._id?.toString(),
    description: tx.reason || "Wallet transaction",
  }));

  return (
    <div className="space-y-8">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <Breadcrumb />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <WalletIcon className="h-7 w-7 text-primary" />
            My Wallet
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your balance and transactions
          </p>
        </div>

        <div className="flex gap-3">
          <WalletPayoutDialog currentBalance={user?.walletBalance || 0} />
          <WalletTopupDialog />
        </div>
      </div>

      {/* BALANCE CARD */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-8 text-center space-y-2">
          <WalletIcon className="h-10 w-10 mx-auto text-primary animate-pulse" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Current Balance
          </p>
          <h2 className="text-4xl font-extrabold">
            KES {formatNumberWithTwoDecimals(user?.walletBalance || 0)}
          </h2>
          <p className="text-xs text-muted-foreground">
            Available for future purchases
          </p>
        </CardContent>
      </Card>

      {/* HISTORY */}
      <div id="wallet-history" className="space-y-4">
        <h2 className="text-xl font-bold">Transaction History</h2>

        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No transactions found.
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
                {history.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t hover:bg-muted/40 transition"
                  >
                    {/* TYPE */}
                    <td className="p-3">
                      <Badge
                        variant={
                          tx.type === "earned" ? "success" : "destructive"
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {tx.type === "earned" ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                        {tx.type}
                      </Badge>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="p-3 font-medium">{tx.description}</td>

                    {/* DATE */}
                    <td className="p-3 text-muted-foreground">
                      {formatDateTime(new Date(tx.date)).dateTime}
                    </td>

                    {/* AMOUNT */}
                    <td
                      className={cn(
                        "p-3 text-right font-bold",
                        tx.type === "earned"
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {tx.type === "earned" ? "+" : "-"}
                      {formatNumberWithTwoDecimals(tx.amount)}
                    </td>

                    {/* ACTION */}
                    <td className="p-3 text-right">
                      {tx.orderId ? (
                        <Link
                          href={`?page=${page}#wallet-history`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View Order
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION (IMPORTANT: HASH SCROLL FIX) */}
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
