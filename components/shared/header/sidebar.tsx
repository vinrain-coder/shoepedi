"use client";

import * as React from "react";
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
import { SignOutButton } from "../sign-out-button";
import { authClient } from "@/lib/auth-client";
import { UserSidebar } from "./user-sidebar";

export default function Sidebar({ categories }: { categories: string[] }) {
  const { data: session } = authClient.useSession();

  return (
    <Drawer direction="left">
      <DrawerTrigger className="header-button flex items-center !p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-300 cursor-pointer">
        <MenuIcon className="h-5 w-5 mr-2" />
        <span className="text-base font-medium">All</span>
      </DrawerTrigger>
      <DrawerContent className="w-[350px] shadow-lg">
        <div className="flex flex-col h-full">
          {/* User Sign In Section */}
          <div className="text-foreground flex items-center justify-between p-4 rounded-t-lg h-10 mt-3w">
            <DrawerHeader>
              <DrawerTitle className="flex items-center text-lg font-semibold">
                <UserCircle className="h-6 w-6 mr-2" />
                {session ? (
                  <DrawerClose asChild>
                    <Link href="/account">
                      <span className="text-lg font-semibold">
                        Hello, {session.user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href="/sign-in">
                      <span className="text-lg font-semibold">
                        Hello, Sign In
                      </span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Shop By Category */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Shop By Category</h2>
            </div>
            <nav className="flex flex-col space-y-2 px-4 py-2">
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link
                    href={`/search?category=${category}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-300"
                  >
                    <span>{category}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          <div className="flex flex-col mb-4">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Help & Settings</h2>
            </div>

            <DrawerClose asChild>
              <Link
                href="/page/customer-service"
                className="item-button py-2 px-4 rounded-md"
              >
                Customer Service
              </Link>
            </DrawerClose>

            {session ? (
              <div className="">
                <UserSidebar />
              </div>
            ) : (
              <DrawerClose asChild>
                <Link
                  href="/sign-in"
                  className="item-button py-2 px-4 rounded-md"
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
