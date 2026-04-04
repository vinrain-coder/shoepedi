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
  IconPalette,
  IconReceipt2,
  IconTags,
  IconSettings,
  IconTicket,
  IconUsers,
  IconMessageCircle,
  IconAffiliate,
  IconCash,
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
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
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
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconClipboardList,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: IconTicket,
    },
  ],
  storefront: [
    {
      name: "Site Pages",
      url: "/admin/web-pages",
      icon: IconFileText,
    },
    {
      name: "Blog Posts",
      url: "/admin/blogs",
      icon: IconArticle,
    },
    {
      name: "Restock Alerts",
      url: "/admin/stockSubs",
      icon: IconBellRinging,
    },
    {
      name: "Customer Reviews",
      url: "/admin/reviews",
      icon: IconChecklist,
    },
    {
      name: "Support Inbox",
      url: "/admin/support",
      icon: IconMessageCircle,
    },
  ],
  catalog: [
    {
      name: "Categories",
      url: "/admin/categories",
      icon: IconCategory,
    },
    {
      name: "Brands",
      url: "/admin/brands",
      icon: IconPalette,
    },
    {
      name: "Tags",
      url: "/admin/tags",
      icon: IconTags,
    },
    {
      name: "Colors",
      url: "/admin/colors",
      icon: IconColorSwatch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/icons/logo.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-base font-semibold">ShoePedi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
