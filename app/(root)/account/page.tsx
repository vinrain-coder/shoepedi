import Breadcrumb from "@/components/shared/breadcrumb";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import AccountOverviewTabs from "@/components/shared/account/account-overview-tabs";
import {
  Home,
  MessageCircle,
  PackageCheckIcon,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { Metadata } from "next";

const PAGE_TITLE = "Your Account";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

const accountCardGroups = [
  {
    value: "orders",
    label: "Orders & Delivery",
    cards: [
      {
        href: "/account/orders",
        title: "Orders",
        description:
          "Track, return, cancel an order, download invoice or buy again",
        icon: PackageCheckIcon,
      },
      {
        href: "/account/addresses",
        title: "Addresses",
        description: "Edit, remove or set a default delivery address",
        icon: Home,
      },
    ],
  },
  {
    value: "activity",
    label: "Your Activity",
    cards: [
      {
        href: "/account/reviews",
        title: "My Reviews",
        description: "See every review you have written and delete when needed",
        icon: Star,
      },
      {
        href: "/account/comments",
        title: "My Comments",
        description: "Find all your blog comments and replies in one place",
        icon: MessageCircle,
      },
    ],
  },
  {
    value: "security",
    label: "Profile & Security",
    cards: [
      {
        href: "/account/manage",
        title: "Login & Security",
        description: "Manage your name, password, and sign-in email settings",
        icon: ShieldCheck,
      },
      {
        href: "/account",
        title: "Account Overview",
        description: "View your account dashboard and manage key preferences",
        icon: User,
      },
    ],
  },
] as const;

export default async function AccountPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Manage your profile, orders, and activity from one place.
        </p>
        <h1 className="h1-bold pt-1">{PAGE_TITLE}</h1>
      </div>

      <AccountOverviewTabs
        groups={accountCardGroups.map((group) => ({
          ...group,
          cards: [...group.cards],
        }))}
      />

      <BrowsingHistoryList className="mt-14" />
    </div>
  );
}
