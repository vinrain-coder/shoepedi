"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

type HeaderSubMenu = {
  name: string;
  href: string;
};

type HeaderMenu = {
  name: string;
  href: string;
  subMenus?: HeaderSubMenu[];
};

export default function HeaderMenuBar({ headerMenus }: { headerMenus: HeaderMenu[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1 py-1 [scrollbar-width:thin]">
      {headerMenus.map((menu) => {
        const hasSubMenus = (menu.subMenus?.length ?? 0) > 0;

        if (!hasSubMenus) {
          return (
            <Link key={menu.href} href={menu.href} className="header-button !p-2 shrink-0">
              {menu.name}
            </Link>
          );
        }

        return (
          <details key={menu.href} className="group relative shrink-0 md:[&_summary::-webkit-details-marker]:hidden">
            <summary className="header-button !p-2 list-none flex cursor-pointer items-center gap-1">
              <span>{menu.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </summary>

            <div className="mt-1 min-w-52 rounded-md border border-border/70 bg-background p-1 shadow-lg md:absolute md:left-0 md:top-full md:z-50 md:hidden md:group-hover:block md:group-focus-within:block">
              <Link
                href={menu.href}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition hover:bg-accent"
              >
                <span>View all {menu.name}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              {menu.subMenus?.map((subMenu) => (
                <Link
                  key={`${menu.href}-${subMenu.href}`}
                  href={subMenu.href}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition hover:bg-accent"
                >
                  <span>{subMenu.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
