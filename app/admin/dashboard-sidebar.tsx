"use client";

import * as React from "react";
import {
  IconArticle,
  IconBellRinging,
  IconCategory,
  IconChecklist,
  IconClipboardList,
  IconDashboard,
  IconFileText,
  IconLayoutGrid,
  IconPalette,
  IconReceipt2,
  IconTags,
  IconSettings,
  IconTicket,
  IconUsers,
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
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/icons/logo.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-base font-semibold">ShoeStar</span>
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
