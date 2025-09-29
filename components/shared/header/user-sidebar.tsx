"use client";

import { IconDotsVertical, IconLogout } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HeartIcon,
  ShieldIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";

export function UserSidebar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending)
    return <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />; // placeholder
  if (!session?.user) return null;

  const initials = getEmailInitials(session.user.email);

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  // helper: closes dropdown on link click
  const handleSelect = (event: Event) => {
    event.preventDefault(); // prevent Radix from keeping it open
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {session.user.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.email}
                  />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session.user.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {session.user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  {session.user.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.email}
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {session.user.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild onSelect={handleSelect}>
                <Link
                  href="/account"
                  className="flex items-center gap-2 w-full"
                >
                  <UserIcon className="h-4 w-4" />
                  Your Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onSelect={handleSelect}>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 w-full"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onSelect={handleSelect}>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 w-full"
                >
                  <HeartIcon className="h-4 w-4" />
                  Wishlist
                </Link>
              </DropdownMenuItem>
              {session?.user?.role === "ADMIN" && (
                <DropdownMenuItem asChild onSelect={handleSelect}>
                  <Link
                    href="/admin/overview"
                    className="flex items-center gap-2 w-full"
                  >
                    <ShieldIcon className="h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getEmailInitials(email?: string | null) {
  if (!email) return "US";
  return email.slice(0, 2).toUpperCase();
}
