import Breadcrumb from "@/components/shared/breadcrumb";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MessageCircle, PackageCheckIcon, Star, User } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const PAGE_TITLE = "Your Account";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

const accountCards = [
  {
    href: "/account/orders",
    title: "Orders",
    description: "Track, return, cancel an order, download invoice or buy again",
    icon: PackageCheckIcon,
  },
  {
    href: "/account/manage",
    title: "Login & security",
    description: "Manage password, email and mobile number",
    icon: User,
  },
  {
    href: "/account/addresses",
    title: "Addresses",
    description: "Edit, remove or set default address",
    icon: Home,
  },
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
];

export default async function AccountPage() {
  return (
    <div>
      <Breadcrumb />
      <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
        {accountCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="transition-shadow hover:shadow-md">
              <Link href={card.href}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div>
                    <Icon className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{card.title}</h2>
                    <p className="text-muted-foreground">{card.description}</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
