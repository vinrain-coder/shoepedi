import { getAffiliateDashboardData } from "@/lib/actions/affiliate.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLinkIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  BadgeCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import CopyButton from "./copy-button";
import Breadcrumb from "@/components/shared/breadcrumb";

export default async function AffiliateDashboardPage() {
  const { success, data, message } = await getAffiliateDashboardData();
  const { site } = await getSetting();

  if (!success || !data) {
    return (
      <div className="container mx-auto py-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Affiliate Program</h1>
        <p className="mb-6">
          {message || "You are not registered as an affiliate."}
        </p>
        <Button asChild>
          <Link href="/affiliate/register">Register Now</Link>
        </Button>
      </div>
    );
  }

  const { affiliate, recentEarnings, recentPayouts } = data;
  const referralLink = `${site.url}?ref=${affiliate.affiliateCode}`;

  return (
    <div className="container mx-auto py-4 space-y-4">
      <Breadcrumb />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              affiliate.status === "approved"
                ? "success"
                : affiliate.status === "pending"
                  ? "pending"
                  : "destructive"
            }
            className="flex items-center gap-1"
          >
            {affiliate.status === "approved" && (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {affiliate.status === "pending" && <Clock className="h-3 w-3" />}
            {affiliate.status === "rejected" && (
              <AlertCircle className="h-3 w-3" />
            )}
            Status: {affiliate.status.toUpperCase()}
          </Badge>

          <Button asChild variant="outline" size="sm">
            <Link href="/affiliate/payouts">Payout History</Link>
          </Button>
        </div>
      </div>

      {/* ❌ REJECTED STATE */}
      {affiliate.status === "rejected" && (
        <Card className="border border-red-200/60 bg-red-50/40 dark:bg-red-950/10 rounded-xl">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-semibold text-red-700">
              Your application was rejected.
            </p>

            {affiliate.adminNote ? (
              <p className="text-sm text-red-700/90">
                Reason: {affiliate.adminNote}
              </p>
            ) : (
              <p className="text-sm text-red-700/90">
                Please review your application details and submit again.
              </p>
            )}

            <Button asChild size="sm" variant="destructive">
              <Link href="/affiliate/register">Update & Reapply</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 📊 MODERN STATS CARDS (UPDATED STYLE) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          {
            id: "balance",
            label: "Current Balance",
            value: affiliate.earningsBalance,
            isPrice: true,
            icon: Wallet,
            hint: "Available for withdrawal",
            color:
              "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
          },
          {
            id: "total",
            label: "Total Earnings",
            value: affiliate.totalEarnings,
            isPrice: true,
            icon: TrendingUp,
            hint: "Lifetime commissions earned",
            color:
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
          },
          {
            id: "code",
            label: "Affiliate Code",
            value: affiliate.affiliateCode,
            isPrice: false,
            icon: BadgeCheck,
            hint: "Your unique referral ID",
            color:
              "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className={cn(
                "rounded-xl border-2 border-primary/20 border-dashed p-3 sm:p-4 transition-all",
                "hover:ring-2 hover:ring-primary/20 hover:shadow-sm",
              )}
            >
              <div className="flex flex-col items-center text-center gap-1">
                {/* ICON */}
                <div className={cn("rounded-full p-2 mb-1", stat.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* LABEL */}
                <p className="text-[10px] sm:text-xs uppercase tracking-tight text-muted-foreground">
                  {stat.label}
                </p>

                {/* VALUE */}
                <div className="flex items-center justify-center gap-2">
                  <p className="text-lg sm:text-xl font-bold leading-tight">
                    {stat.isPrice
                      ? formatCurrency(stat.value as number)
                      : stat.value}
                  </p>

                  {stat.id === "code" && (
                    <CopyButton value={String(stat.value)} />
                  )}
                </div>

                {/* HINT */}
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {stat.hint}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔗 REFERRAL LINK */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <code className="block w-full pr-20 p-3 bg-muted rounded-lg border truncate text-sm">
                {referralLink}
              </code>

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <CopyButton value={referralLink} />

                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <a
                    href={referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Share this link with your audience. When they make a purchase using
            your link, you earn commission!
          </p>
        </CardContent>
      </Card>

      {/* 📦 TABLES SECTION (UNCHANGED) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEarnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No earnings yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentEarnings.map((earning: any) => (
                  <div
                    key={earning._id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        Order #{earning.order?.trackingNumber || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{formatCurrency(earning.amount)}
                      </p>

                      <Badge
                        variant={
                          earning.status === "earned"
                            ? "success"
                            : earning.status === "pending"
                              ? "pending"
                              : "destructive"
                        }
                        className="text-[10px] h-4 flex items-center gap-1"
                      >
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayouts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payout history.
              </p>
            ) : (
              <div className="space-y-4">
                {recentPayouts.map((payout: any) => (
                  <div
                    key={payout._id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{payout.paymentMethod}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        -{formatCurrency(payout.amount)}
                      </p>

                      <Badge
                        variant={
                          payout.status === "paid"
                            ? "success"
                            : payout.status === "pending"
                              ? "pending"
                              : "destructive"
                        }
                        className="text-[10px] flex items-center gap-1"
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
