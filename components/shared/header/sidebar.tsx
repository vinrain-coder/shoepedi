"use client";

import Link from "next/link";
import {
  X,
  ChevronRight,
  UserCircle,
  MenuIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { authClient } from "@/lib/auth-client";
import { UserSidebar } from "./user-sidebar";

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const { data: session } = authClient.useSession();

  return (
    <Drawer direction="left">
      {/* Trigger */}
      <DrawerTrigger className="header-button flex items-center gap-2 !p-2 rounded-md transition hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
        <MenuIcon className="h-5 w-5" />
        <span className="text-base font-medium">All</span>
      </DrawerTrigger>

      {/* Drawer Content */}
      <DrawerContent className="w-[350px] shadow-lg">
        <div className="flex h-full flex-col">
          {/* ---------------- Header / User Section ---------------- */}
          <div className="flex items-center justify-between p-4 text-foreground">
            <DrawerHeader className="p-0">
              <DrawerTitle className="flex items-center text-lg font-semibold">
                <UserCircle className="mr-2 h-6 w-6" />

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
            </DrawerHeader>

            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* ---------------- Categories ---------------- */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold">
                Shop By Category
              </h2>
            </div>

            <nav className="flex flex-col gap-2 px-4 pb-4">
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <span>{category}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          {/* ---------------- Footer ---------------- */}
          <div className="flex flex-col gap-2 border-t p-4">
            <DrawerClose asChild>
              <Link
                href="/page/customer-service"
                className="item-button rounded-md px-4 py-2"
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
                  className="item-button rounded-md px-4 py-2"
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
              
