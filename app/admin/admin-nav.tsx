"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

const links = [
  {
    title: "Overview",
    href: "/admin/overview",
  },
  {
    title: "Products",
    href: "/admin/products",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Pages",
    href: "/admin/web-pages",
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
  },
  {
    title: "StockSubs",
    href: "/admin/stockSubs",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
];

export function AdminNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center flex-wrap overflow-hidden gap-1 md:gap-2",
        className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-2 py-2 rounded-lg hover:text-primary active:bg-gray-300 transition duration-200",
            pathname.includes(item.href)
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
