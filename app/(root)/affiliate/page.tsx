import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAffiliateStatus } from "@/lib/actions/affiliate.actions";
import { getServerSession } from "@/lib/get-session";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Users,
  BarChart3,
  Wallet,
  UserPlus,
  BadgeCheck,
  Share2,
  DollarSign,
} from "lucide-react";
import Breadcrumb from "@/components/shared/breadcrumb";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function AffiliatePage() {
  const { affiliate: settings, site } = await getSetting();
  const session = await getServerSession();
  const affiliateStatus = session
    ? await getAffiliateStatus()
    : { exists: false };
  const commissionRate = settings?.commissionRate;
  const minimumPayout = settings.minWithdrawalAmount;

  return (
    <div className="container mx-auto py-6 space-y-12">
      <Breadcrumb />

      {/* HERO */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Join the {site?.name} Affiliate Program and Start Earning Today!
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
                  <CheckCircle className="h-4 w-4" />
                  {affiliateStatus.status?.toUpperCase()}
                </Badge>
              </div>

              {affiliateStatus.status === "approved" ? (
                <Button
                  asChild
                  size="lg"
                  className="font-semibold text-xl rounded-full"
                >
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

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Generous Commissions",
            description: `Earn up to ${commissionRate}% on every successful referral purchase made using your code.`,
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
        ].map((feature, i) => {
          const Icon = feature.icon;

          return (
            <Card
              key={i}
              className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
            >
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>

                <CardTitle className="text-lg leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
            </Card>
          );
        })}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">How it Works</h2>
            <p className="text-muted-foreground">
              Start earning in just a few simple steps
            </p>
          </div>

          <div className="space-y-8 relative border-l border-primary/20 pl-6">
            {(() => {
              const isLoggedIn = !!session;
              const isAffiliate = (affiliateStatus as any)?.exists;

              const redirectBack = "/affiliate";

              const signUpUrl = `/sign-in?redirect=${encodeURIComponent(
                "/affiliate/register",
              )}`;

              const registerUrl = "/affiliate/register";
              const dashboardUrl = "/affiliate/dashboard";

              return [
                {
                  title: "Sign Up",
                  desc: "Register for an account and apply for the affiliate program.",
                  icon: UserPlus,
                  action: !isLoggedIn
                    ? signUpUrl
                    : isAffiliate
                      ? dashboardUrl
                      : registerUrl,
                  actionLabel: !isLoggedIn
                    ? "Create Account"
                    : isAffiliate
                      ? "Go to Dashboard"
                      : "Apply Now",
                },
                {
                  title: "Get Your Code",
                  desc: "Once approved, you will create your unique affiliate code and get your referral link.",
                  icon: BadgeCheck,
                  action: isAffiliate ? dashboardUrl : registerUrl,
                  actionLabel: isAffiliate ? "View Code" : "Get Started",
                },
                {
                  title: "Share Products",
                  desc: `Promote ${site.name} products to your audience using your code.`,
                  icon: Share2,
                  action: "/search",
                  actionLabel: "Browse Products",
                },
                {
                  title: "Earn Commission",
                  desc: "Receive commissions for every successful purchase made using your code at checkout.",
                  icon: DollarSign,
                  action: isAffiliate ? dashboardUrl : registerUrl,
                  actionLabel: isAffiliate ? "View Earnings" : "Join Program",
                },
              ];
            })().map((step, i) => {
              const Icon = step.icon;

              return (
                <div key={i} className="relative pl-2 space-y-2">
                  <div className="absolute -left-9.5 top-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      {step.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>

                    {/* CTA LINK */}
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="underline"
                    >
                      <Link href={step.action as string}>
                        {step.actionLabel}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (NEW) */}
      {/* FAQ SECTION */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Everything you need to know about the affiliate program
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full rounded-2xl border bg-card px-6"
        >
          {[
            {
              q: "How do payouts work?",
              a: `Payouts are calculated based on paid orders or sales made through your referral code. The payout amount is ${commissionRate}% of the total price of items purchased, excluding tax and delivery fees. Once validated, earnings are credited to your affiliate balance.`,
            },
            {
              q: "When do I get paid?",
              a: `Payments are processed weekly on Thursdays. Once you reach the minimum payout threshold of ${minimumPayout}, you can request a payout. Earnings are sent to your provided M-Pesa account.`,
            },
            {
              q: "What if a customer refunds?",
              a: "If a customer requests a refund or cancels their order, the associated commission will be reversed to keep tracking fair and accurate.",
            },
            {
              q: "How are referrals tracked?",
              a: (
                <>
                  You can track your referrals in your dashboard{" "}
                  <Link
                    href="/affiliate/dashboard"
                    className="text-primary underline"
                  >
                    here
                  </Link>
                  . When a user completes a purchase, the system automatically
                  attributes the sale to your account.
                </>
              ),
            },
          ].map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline cursor-pointer">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
