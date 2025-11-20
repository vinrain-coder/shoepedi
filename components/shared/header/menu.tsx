"use client";

import { UserRoundCheck, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CartButton from "./cart-button";
import UserButton from "./user-button";
import ThemeSwitcher from "./theme-switcher";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <nav className="md:flex gap-3 hidden w-full">
        <ThemeSwitcher />
        <UserButton />
        {!forAdmin && <CartButton />}
      </nav>

      <nav className="md:hidden flex gap-1">
        {!forAdmin && <CartButton />}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="align-middle header-button">
            {session ? (
              <UserRoundCheck className="h-7 w-7" />
            ) : (
              <UserRoundPlus className="h-7 w-7" />
            )}
          </SheetTrigger>

          <SheetContent className="bg-black text-white flex flex-col items-start">
            <SheetHeader className="w-full">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white ml-2">Site Menu</SheetTitle>
                <SheetDescription></SheetDescription>
              </div>
            </SheetHeader>

            {/* Close on click */}
            <ThemeSwitcher />

            <Link href="/account" onClick={() => setOpen(false)}>
              <UserButton />
            </Link>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
