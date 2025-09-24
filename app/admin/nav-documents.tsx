"use client";

import { Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link
                href={item.url}
                onClick={() => {
                  if (isMobile) toggleSidebar(); // close sidebar on mobile
                }}
                className="flex items-center gap-2"
              >
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
