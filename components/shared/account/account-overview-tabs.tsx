"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, Coins as CoinsIcon, Headset, Home, MessageCircle, PackageCheckIcon, ShieldCheck, Star, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AccountLink = {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const tabGroups: {
  value: string;
  label: string;
  links: AccountLink[];
}[] = [
  {
    value: "account",
    label: "Account",
    links: [
      {
        href: "/account/orders",
        title: "Orders",
        description: "Track, return, cancel an order, download invoice or buy again",
        icon: PackageCheckIcon,
      },
      {
        href: "/account/addresses",
        title: "Addresses",
        description: "Edit, remove or set your default delivery address",
        icon: Home,
      },
      {
        href: "/account/manage",
        title: "Login & security",
        description: "Update your profile details, email and password",
        icon: ShieldCheck,
      },
      {
        href: "/account/coins",
        title: "My Coins",
        description: "Check your balance and view coin transaction history",
        icon: CoinsIcon,
      },
      {
        href: "/account/wallet",
        title: "My Wallet",
        description: "View your refund balance and transaction history",
        icon: ShieldCheck,
      },
    ],
  },
  {
    value: "content",
    label: "Content",
    links: [
      {
        href: "/account/reviews",
        title: "My Reviews",
        description: "See every review you have written and remove outdated ones",
        icon: Star,
      },
      {
        href: "/account/comments",
        title: "My Comments",
        description: "View blog comments and keep your conversations organized",
        icon: MessageCircle,
      },
      {
        href: "/account/support",
        title: "Support",
        description: "Submit complaints, queries, or recommendations and track replies",
        icon: Headset,
      },
    ],
  },
  {
    value: "explore",
    label: "Explore",
    links: [
      {
        href: "/account/wishlist",
        title: "Wishlist",
        description: "Pick up where you left off with saved products",
        icon: User,
      },
      {
        href: "/search",
        title: "Browse products",
        description: "Jump into discovery with filters and curated listings",
        icon: PackageCheckIcon,
      },
    ],
  },
];

export function AccountOverviewTabs() {
  return (
    <Tabs defaultValue="account" className="w-full gap-4">
      <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-xl p-1 sm:grid-cols-3">
        {tabGroups.map((group) => (
          <TabsTrigger
            key={group.value}
            value={group.value}
            className="min-h-10 w-full rounded-lg px-4"
          >
            {group.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabGroups.map((group) => (
        <TabsContent key={group.value} value={group.value}>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  className={cn(
                    "group min-w-0 rounded-xl border bg-card p-4 transition-all",
                    "hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent/30 hover:shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border bg-background p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold leading-none sm:text-base">{link.title}</h2>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{link.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
