"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  MessageCircle,
  ShieldIcon,
  Star,
  Users,
  History,
} from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "../sign-out-button";
import { authClient } from "@/lib/auth-client";

export default function UserButton() {
  const { data: session } = authClient.useSession();
  const isAffiliate = (session?.user as any)?.isAffiliate;

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="header-button cursor-pointer" asChild>
          <div className="flex items-center">
            <div className="flex flex-col text-xs text-left ml-6 md:ml-0">
              <span>Hello, {session ? session.user.name : "Sign in"}</span>
              <span className="font-bold">Account & Orders</span>
            </div>
            <ChevronDownIcon />
          </div>
        </DropdownMenuTrigger>

        {session ? (
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup>
              <Link href="/account" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <UserIcon className="h-4 w-4" /> Account
                </DropdownMenuItem>
              </Link>
              <Link href="/account/orders" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <ShoppingCartIcon className="h-4 w-4" /> Orders
                </DropdownMenuItem>
              </Link>
              <Link href="/account/wishlist" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <HeartIcon className="h-4 w-4" />
                  Wishlist
                </DropdownMenuItem>
              </Link>

              <Link href="/account/reviews" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4" />
                  My Reviews
                </DropdownMenuItem>
              </Link>
              <Link href="/account/comments" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="h-4 w-4" />
                  My Comments
                </DropdownMenuItem>
              </Link>
              <Link href="/browsing-history" className="w-full">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <History className="h-4 w-4" />
                  Browsing History
                </DropdownMenuItem>
              </Link>
              {isAffiliate && (
                <Link href="/affiliate/dashboard" className="w-full">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4" />
                    Affiliate Dashboard
                  </DropdownMenuItem>
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link href="/admin/overview" className="w-full">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <ShieldIcon className="h-4 w-4" /> Admin
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>

            <DropdownMenuItem className="p-0 mb-1 flex items-center gap-4">
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className={cn(buttonVariants(), "w-full")}
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="font-normal">
                New Customer? <Link href="/sign-up">Sign up</Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
