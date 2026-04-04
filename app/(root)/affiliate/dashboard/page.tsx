import { getAffiliateDashboardData } from "@/lib/actions/affiliate.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import CopyButton from "./copy-button";

export default async function AffiliateDashboardPage() {
  const { success, data, message } = await getAffiliateDashboardData();
  const { site } = await getSetting();

  if (!success || !data) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Affiliate Program</h1>
        <p className="mb-6">{message || "You are not registered as an affiliate."}</p>
        <Button asChild>
          <Link href="/affiliate/register">Register Now</Link>
        </Button>
      </div>
    );
  }

  const { affiliate, recentEarnings, recentPayouts } = data;
  const referralLink = `${site.url}?ref=${affiliate.affiliateCode}`;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <div className="flex items-center gap-2">
           <Badge variant={affiliate.status === "approved" ? "default" : affiliate.status === "pending" ? "outline" : "destructive"}>
            Status: {affiliate.status.toUpperCase()}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href="/affiliate/payouts">Payout History</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(affiliate.earningsBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
            {affiliate.status === "approved" && (
                <Button asChild size="sm" className="mt-4 w-full">
                    <Link href="/affiliate/payouts">Request Payout</Link>
                </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(affiliate.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Affiliate Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliate.affiliateCode}</div>
             <p className="text-xs text-muted-foreground mt-1">Your unique identifier</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded border truncate">
              {referralLink}
            </code>
            <CopyButton value={referralLink} />
            <Button asChild variant="outline" size="icon">
                <a href={referralLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-4 w-4" />
                </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Share this link with your audience. When they make a purchase using your link, you earn commission!
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEarnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No earnings yet.</p>
            ) : (
              <div className="space-y-4">
                {recentEarnings.map((earning: any) => (
                  <div key={earning._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Order #{earning.order?.trackingNumber || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{formatCurrency(earning.amount)}</p>
                      <Badge variant="outline" className="text-[10px] h-4">
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
              <p className="text-center text-muted-foreground py-8">No payout history.</p>
            ) : (
              <div className="space-y-4">
                {recentPayouts.map((payout: any) => (
                  <div key={payout._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{payout.paymentMethod}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">-{formatCurrency(payout.amount)}</p>
                      <Badge variant={payout.status === "paid" ? "default" : "outline"} className="text-[10px] h-4">
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
