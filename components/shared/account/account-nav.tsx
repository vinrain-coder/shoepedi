"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const accountNavGroups = [
  {
    value: "account",
    label: "Account",
    items: [
      { href: "/account", label: "Overview", description: "Your account home" },
      {
        href: "/account/orders",
        label: "Orders",
        description: "Track and manage purchases",
      },
      {
        href: "/account/addresses",
        label: "Addresses",
        description: "Manage delivery addresses",
      },
    ],
  },
  {
    value: "content",
    label: "Content",
    items: [
      {
        href: "/account/reviews",
        label: "My Reviews",
        description: "View and delete product reviews",
      },
      {
        href: "/account/comments",
        label: "My Comments",
        description: "View and delete blog comments",
      },
    ],
  },
  {
    value: "settings",
    label: "Settings",
    items: [
      {
        href: "/account/manage",
        label: "Login & Security",
        description: "Update profile, email and password",
      },
    ],
  },
] as const;

function resolveGroup(pathname: string) {
  const match = accountNavGroups.find((group) =>
    group.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ),
  );
  return match?.value ?? "account";
}

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <h2 className="px-2 pb-3 text-sm font-semibold text-muted-foreground">
        Account navigation
      </h2>

      <Tabs value={resolveGroup(pathname)} className="gap-3">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {accountNavGroups.map((group) => (
            <TabsTrigger
              key={group.value}
              value={group.value}
              className="h-8 flex-1 min-w-[86px] data-[state=active]:bg-background"
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {accountNavGroups.map((group) => (
          <TabsContent key={group.value} value={group.value} className="mt-0">
            <ul className="grid gap-2">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/account" &&
                    pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-xl border px-3 py-2 transition-colors hover:bg-accent/60",
                        isActive && "border-primary bg-primary/10",
                      )}
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
