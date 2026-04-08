"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-1 py-1 [scrollbar-width:thin]">
      {headerMenus.map((menu) => {
        const hasSubMenus = (menu.subMenus?.length ?? 0) > 0;

        if (!hasSubMenus) {
          return (
            <Link key={menu.href} href={menu.href} className="header-button !p-2 shrink-0 text-sm">
              {menu.name}
            </Link>
          );
        }

        return <HeaderDropdownMenu key={menu.href} menu={menu} />;
      })}
    </div>
  );
}

function HeaderDropdownMenu({ menu }: { menu: HeaderMenu }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="header-button !p-2 shrink-0 text-sm inline-flex items-center gap-1"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span>{menu.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-60 rounded-xl border-border/70 p-1.5"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          {menu.name}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href={menu.href}
            className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
          >
            <span>View all {menu.name}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {menu.subMenus?.map((subMenu) => (
          <DropdownMenuItem key={`${menu.href}-${subMenu.href}`} asChild>
            <Link
              href={subMenu.href}
              className="flex items-center justify-between rounded-md px-2 py-2 text-sm"
            >
              <span>{subMenu.name}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
