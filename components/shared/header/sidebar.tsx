"use client";

import Link from "next/link";
import { X, ChevronRight, UserCircle, MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import { authClient } from "@/lib/auth-client";
import { UserSidebar } from "./user-sidebar";

interface SidebarProps {
  categories: string[];
  brands: string[];
}

export default function Sidebar({ categories, brands }: SidebarProps) {
  const { data: session } = authClient.useSession();

  return (
    <Drawer direction="left">
      {/* Trigger */}
      <DrawerTrigger className="header-button flex items-center gap-2 !p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition">
        <MenuIcon className="h-5 w-5" />
        <span className="text-base font-medium">All</span>
      </DrawerTrigger>

      {/* Drawer */}
      <DrawerContent className="w-[350px] max-w-[90vw] shadow-xl">
        <div className="flex flex-col h-full">
          {/* ---------------- HEADER ---------------- */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle className="flex items-center gap-2 text-lg font-semibold">
                <UserCircle className="h-6 w-6" />
                {session ? (
                  <DrawerClose asChild>
                    <Link href="/account" className="hover:underline">
                      Hello, {session.user.name}
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href="/sign-in" className="hover:underline">
                      Hello, Sign In
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>

              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>
          </div>

          {/* ---------------- CONTENT ---------------- */}
          <div className="flex-1 overflow-y-auto">
            {/* -------- Categories -------- */}
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Shop by Category
              </h2>
            </div>

            <nav className="px-2">
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition"
                  >
                    <span>{category}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </DrawerClose>
              ))}
            </nav>

            <Separator className="my-4" />

            {/* -------- Brands -------- */}
            <div className="px-4 py-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Shop by Brand
              </h2>
            </div>

            <nav className="px-2 pb-4 max-h-[260px] overflow-y-auto">
              {brands.map((brand) => (
                <DrawerClose asChild key={brand}>
                  <Link
                    href={`/search?brand=${encodeURIComponent(brand)}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition"
                  >
                    <span>{brand}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          {/* ---------------- FOOTER ---------------- */}
          <div className="border-t px-4 py-3 space-y-2">
            <DrawerClose asChild>
              <Link
                href="/page/customer-service"
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted transition"
              >
                Customer Service
              </Link>
            </DrawerClose>

            {session ? (
              <UserSidebar />
            ) : (
              <DrawerClose asChild>
                <Link
                  href="/sign-in"
                  className="block rounded-md px-3 py-2 text-sm hover:bg-muted transition"
                >
                  Sign In
                </Link>
              </DrawerClose>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
  }
      
