"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileText,
  IconHelp,
  IconListDetails,
  IconMessageCircle,
  IconReport,
  IconSearch,
  IconSettings,
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
      icon: IconListDetails,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconChartBar,
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
      icon: IconHelp,
    },
    {
      title: "Marketing",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Pages",
      url: "/admin/web-pages",
      icon: IconDatabase,
    },
    {
      name: "Blogs",
      url: "/admin/blogs",
      icon: IconReport,
    },
    {
      name: "Stock Subscriptions",
      url: "/admin/stockSubs",
      icon: IconFileText,
    },
    {
      name: "Reviews",
      url: "/admin/reviews",
      icon: IconMessageCircle,
    },
  ],
  content: [
    {
      name: "Categories",
      url: "/admin/categories",
      icon: IconDatabase,
    },
    {
      name: "Brands",
      url: "/admin/brands",
      icon: IconReport,
    },
    {
      name: "Tags",
      url: "/admin/tags",
      icon: IconFileText,
    },
    {
      name: "Colors",
      url: "/admin/colors",
      icon: IconMessageCircle,
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
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        <NavContent items={data.content} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
