"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminUserButton } from "./AdminUserButton";
import { useIsMobile } from "@/hooks/use-mobile";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Newspaper,
  Boxes,
  Star,
  Settings,
  BarChart3,
  Megaphone,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const managementLinks = [
  { title: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Users", href: "/admin/users", icon: Users },
];

const contentLinks = [
  { title: "Pages", href: "/admin/web-pages", icon: FileText },
  { title: "Blogs", href: "/admin/blogs", icon: Newspaper },
  { title: "StockSubs", href: "/admin/stockSubs", icon: Boxes },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
];

const systemLinks = [
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

const moreLinks = [
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Marketing", href: "/admin/marketing", icon: Megaphone },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar = ({
  isOpen,
  onClose,
}: DashboardSidebarProps) => {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const isMobile = useIsMobile();

  const handleLinkClick = (href: string) => {
    if (isMobile) onClose();
  };

  const renderLinks = (links: { title: string; href: string; icon: any }[]) => (
    <SidebarMenu>
      {links.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            className={cn(
              "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
              pathname === item.href &&
                "bg-linear-to-r/oklch border-[#5D6B68]/10"
            )}
            isActive={pathname === item.href}
          >
            <button
              onClick={() => handleLinkClick(item.href)}
              className="flex items-center gap-2 w-full text-left"
            >
              <item.icon className="size-5" />
              <span className="text-sm font-medium tracking-tight">
                {item.title}
              </span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:relative lg:translate-x-0 transition-transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <Sidebar className="h-full w-64 bg-sidebar text-white flex flex-col">
        {/* Sidebar Header */}
        <SidebarHeader className="text-sidebar-accent-foreground">
          <Link href="/" className="flex items-center gap-2 px-4 pt-4">
            <Image src="/icons/logo.svg" width={36} height={36} alt="Logo" />
            <p className="text-2xl font-semibold">ShoePedi</p>
          </Link>
        </SidebarHeader>

        <div className="px-4 py-2">
          <Separator className="opacity-10 text-[#5D6B68]" />
        </div>

        {/* Sidebar Content */}
        <SidebarContent className="flex-1 overflow-y-auto lg:overflow-y-visible px-2">
          {/* Management */}
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderLinks(managementLinks)}
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="opacity-10 text-[#5D6B68] my-2" />

          {/* Content */}
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderLinks(contentLinks)}
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="opacity-10 text-[#5D6B68] my-2" />

          {/* System */}
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderLinks(systemLinks)}

              {/* Collapsible More Section */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-2 px-2 py-2 w-full text-sm font-medium text-left hover:bg-sidebar-accent/10 rounded-md transition"
              >
                {showMore ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
                More
              </button>

              {showMore && <div className="pl-4">{renderLinks(moreLinks)}</div>}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter className="px-4 py-4 border-t border-sidebar/20">
          <AdminUserButton />
        </SidebarFooter>
      </Sidebar>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
