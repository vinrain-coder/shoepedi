"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    comingSoon?: boolean;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            const isDisabled = item.comingSoon || item.url === "#";
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={!isDisabled}
                  isActive={isActive}
                  tooltip={
                    item.comingSoon ? `${item.title} (Coming Soon)` : item.title
                  }
                  className={cn(
                    "transition-all duration-200",
                    isActive &&
                      "bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-r-2 border-primary",
                    isDisabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isDisabled ? (
                    <div className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      onClick={() => {
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
