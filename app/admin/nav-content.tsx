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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavContent({
  title = "Content",
  items,
}: {
  title?: string;
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={cn(
                  "transition-all duration-200",
                  isActive &&
                    "bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-r-2 border-primary",
                )}
              >
                <Link
                  href={item.url}
                  onClick={() => {
                    if (isMobile) toggleSidebar(); // close sidebar on mobile
                  }}
                  className="flex items-center gap-2"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
