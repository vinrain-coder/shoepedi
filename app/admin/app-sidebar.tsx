"use client";

import * as React from "react";
import {
  IconArticle,
  IconBellRinging,
  IconCategory,
  IconChecklist,
  IconClipboardList,
  IconColorSwatch,
  IconDashboard,
  IconFileText,
  IconLayoutGrid,
  IconMail,
  IconPalette,
  IconReceipt2,
  IconTags,
  IconSettings,
  IconTicket,
  IconUsers,
  IconMessageCircle,
  IconAffiliate,
  IconCash,
  IconMapPin,
  IconCoin,
} from "@tabler/icons-react";

import { NavMain } from "@/app/admin/nav-main";
import { NavSecondary } from "@/app/admin/nav-secondary";
import { NavUser } from "@/app/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { NavDocuments } from "./nav-documents";
import { NavContent } from "./nav-content";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin/overview",
      icon: IconDashboard,
    },
  ],
  operations: [
    {
      title: "Products",
      url: "/admin/products",
      icon: IconLayoutGrid,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconReceipt2,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: IconTicket,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Delivery Locations",
      url: "/admin/delivery-locations",
      icon: IconMapPin,
    },
  ],
  finance: [
    {
      title: "Affiliates",
      url: "/admin/affiliates",
      icon: IconAffiliate,
    },
    {
      title: "Payouts",
      url: "/admin/payouts",
      icon: IconCash,
    },
    {
      title: "Coins",
      url: "/admin/coins",
      icon: IconCoin,
    },
  ],
  storefront: [
    {
      title: "Site Pages",
      url: "/admin/web-pages",
      icon: IconFileText,
    },
    {
      title: "Blog Posts",
      url: "/admin/blogs",
      icon: IconArticle,
    },
    {
      title: "Restock Alerts",
      url: "/admin/stockSubs",
      icon: IconBellRinging,
    },
    {
      title: "Customer Reviews",
      url: "/admin/reviews",
      icon: IconChecklist,
    },
    {
      title: "Support Inbox",
      url: "/admin/support",
      icon: IconMessageCircle,
    },
    {
      title: "Newsletters",
      url: "/admin/newsletters",
      icon: IconMail,
    },
  ],
  catalog: [
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconCategory,
    },
    {
      title: "Brands",
      url: "/admin/brands",
      icon: IconPalette,
    },
    {
      title: "Tags",
      url: "/admin/tags",
      icon: IconTags,
    },
    {
      title: "Colors",
      url: "/admin/colors",
      icon: IconColorSwatch,
    },
  ],
  navSecondary: [
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconClipboardList,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({
  siteLogo,
  siteName,
  ...props
}: React.ComponentProps<typeof Sidebar> & { siteLogo: string; siteName: string }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src={siteLogo}
                  alt="Logo"
                  width={36}
                  height={36}
                  className="rounded"
                />
                <span className="text-base font-semibold">{siteName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments title="Operations" items={data.operations} />
        <NavDocuments title="Finance" items={data.finance} />
        <NavDocuments title="Storefront" items={data.storefront} />
        <NavContent title="Catalog" items={data.catalog} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
