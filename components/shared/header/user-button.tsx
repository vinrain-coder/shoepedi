import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "../sign-out-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function UserButton() {
  // In a Server Component or Server Action
  const session = await auth.api.getSession({ headers: await headers() });
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
              <Link className="w-full" href="/account">
                <DropdownMenuItem>Your account</DropdownMenuItem>
              </Link>
              <Link className="w-full" href="/account/orders">
                <DropdownMenuItem>Your orders</DropdownMenuItem>
              </Link>
              <Link className="w-full" href="/wishlist">
                <DropdownMenuItem>Your wishlist</DropdownMenuItem>
              </Link>
              {session.user.role === "ADMIN" && (
                <Link className="w-full" href="/admin/overview">
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className="p-0 mb-1">
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
