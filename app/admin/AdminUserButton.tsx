"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { authClient } from "@/lib/auth-client";
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export const AdminUserButton = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
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

  const onBilling = () => {
    // handle billing redirect here
    router.push("/account/billing");
  };

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
            <Avatar>
              {session.user.image ? (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.email}
                />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
              <p className="text-sm truncate w-full">{session.user.name}</p>
              <p className="text-xs truncate w-full">{session.user.email}</p>
            </div>
            <ChevronDownIcon className="size-4 shrink-0" />
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{session.user.name}</DrawerTitle>
            <DrawerDescription>{session.user.email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex gap-2">
            <Button variant="outline" onClick={onBilling}>
              <CreditCardIcon className="size-4" />
              Billing
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOutIcon className="size-4" />
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop / Dropdown Menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between overflow-hidden gap-x-2"
        >
          <Avatar>
            {session.user.image ? (
              <AvatarImage src={session.user.image} alt={session.user.email} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            <p className="text-sm truncate w-full">{session.user.name}</p>
            <p className="text-xs truncate w-full">{session.user.email}</p>
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{session.user.name}</span>
            <span className="font-normal text-sm truncate">
              {session.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onBilling}
          className="flex items-center justify-between"
        >
          Billing
          <CreditCardIcon className="size-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center justify-between"
        >
          Logout
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function getEmailInitials(email?: string | null) {
  if (!email) return "US";
  return email.slice(0, 2).toUpperCase();
}
