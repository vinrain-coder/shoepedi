"use client";

import React, { useState } from "react";
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
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const handleToggle = (key: string, shouldOpen: boolean) => {
    setActiveMenuKey(shouldOpen ? key : null);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-1 py-1 [scrollbar-width:thin]">
      {headerMenus.map((menu) => {
        const hasSubMenus = (menu.subMenus?.length ?? 0) > 0;

        if (!hasSubMenus) {
          return (
            <Link key={menu.href} href={menu.href} className="header-button p-2 shrink-0 text-sm">
              {menu.name}
            </Link>
          );
        }

        return (
          <HeaderDropdownMenu
            key={menu.href}
            menu={menu}
            isActive={activeMenuKey === menu.href}
            onToggle={(shouldOpen) => handleToggle(menu.href, shouldOpen)}
          />
        );
      })}
    </div>
  );
}

function HeaderDropdownMenu({
  menu,
  isActive,
  onToggle,
}: {
  menu: HeaderMenu;
  isActive: boolean;
  onToggle: (shouldOpen: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Sync local open state with parent's active state
  React.useEffect(() => {
    if (!isActive) {
      setOpen(false);
      setIsClicked(false);
    }
  }, [isActive]);

  const handleMouseEnter = () => {
    // Only open on hover on desktop-like devices (not touch-primary)
    if (window.matchMedia("(hover: hover)").matches) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isClicked) {
      setOpen(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary button (left click) without modifiers
    if (
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    // Only toggle sticky state on desktop (hover-capable)
    if (window.matchMedia("(hover: hover)").matches) {
      if (isClicked) {
        setIsClicked(false);
        setOpen(false);
        onToggle(false);
      } else {
        setIsClicked(true);
        setOpen(true);
        onToggle(true);
      }
      // Prevent Radix from doing its own toggle which might race
      e.preventDefault();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsClicked(false);
      onToggle(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <button
          type="button"
          className="header-button p-2 shrink-0 text-sm inline-flex items-center gap-1 outline-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onPointerDown={handlePointerDown}
        >
          <span>{menu.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-60 rounded-xl border-border/70 p-1.5"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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