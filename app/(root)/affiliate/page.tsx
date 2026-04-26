import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAffiliateStatus } from "@/lib/actions/affiliate.actions";
import { getServerSession } from "@/lib/get-session";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BarChart3, Wallet } from "lucide-react";
import Breadcrumb from "@/components/shared/breadcrumb";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function AffiliatePage() {
  const { site } = await getSetting();
  const session = await getServerSession();
  const affiliateStatus = session
    ? await getAffiliateStatus()
    : { exists: false };

  return (
    <div className="container mx-auto py-10 space-y-12">
      <Breadcrumb />
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Join the ${site?.name} Affiliate Program and Start Earning Today!
        </h1>
        <p className="text-xl text-muted-foreground">
          Partner with Kenya&apos;s premium footwear store and earn commissions
          for every sale you refer.
        </p>
        <div className="pt-4">
          {!session ? (
            <Button asChild size="lg">
              <Link href="/sign-in?redirect=/affiliate">Sign in to Join</Link>
            </Button>
          ) : (affiliateStatus as any).error ? (
            <div className="space-y-4">
              <p className="text-destructive">
                Error loading affiliate status:{" "}
                {(affiliateStatus as any).message}
              </p>
              <Button asChild variant="outline">
                <Link href="/affiliate">Retry</Link>
              </Button>
            </div>
          ) : !affiliateStatus.exists ? (
            <Button asChild size="lg">
              <Link href="/affiliate/register">Become an Affiliate</Link>
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge
                  variant={
                    affiliateStatus.status === "approved"
                      ? "success"
                      : affiliateStatus.status === "pending"
                        ? "pending"
                        : "destructive"
                  }
                >
                  {affiliateStatus.status?.toUpperCase()}
                </Badge>
              </div>
              {affiliateStatus.status === "approved" ? (
                <Button asChild size="lg">
                  <Link href="/affiliate/dashboard">Go to Dashboard</Link>
                </Button>
              ) : affiliateStatus.status === "rejected" ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">
                    Your application was rejected: {affiliateStatus.adminNote}
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/affiliate/register">Resubmit Application</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We are currently reviewing your application.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Generous Commissions",
            description:
              "Earn up to 10% on every successful referral purchase made using your code.",
            icon: Wallet,
          },
          {
            title: "Exclusive Discounts",
            description:
              "Offer your audience exclusive discount rates to drive more conversions.",
            icon: Users,
          },
          {
            title: "Real-time Tracking",
            description:
              "Monitor your earnings, clicks, and referrals through our dedicated dashboard.",
            icon: BarChart3,
          },
          {
            title: "Quality Products",
            description:
              "Refer customers to authentic, premium footwear from top global brands.",
            icon: CheckCircle,
          },
        ].map((feature, i) => (
          <Card key={i}>
            <CardHeader>
              <feature.icon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="bg-muted rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">How it Works</h2>
          <ol className="space-y-6 list-decimal list-inside text-lg">
            <li>
              <span className="font-semibold">Sign Up:</span> Register for an
              account and apply for the affiliate program.
            </li>
            <li>
              <span className="font-semibold">Get Your Code:</span> Once
              approved, receive a unique affiliate code and referral links.
            </li>
            <li>
              <span className="font-semibold">Share:</span> Promote {site.name}{" "}
              products to your audience using your code.
            </li>
            <li>
              <span className="font-semibold">Earn:</span> Receive commissions
              for every purchase made with your code.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
