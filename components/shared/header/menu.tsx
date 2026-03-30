"use client";

import { LogIn, UserRoundCheck, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CartButton from "./cart-button";
import UserButton from "./user-button";
import ThemeSwitcher from "./theme-switcher";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import data from "@/lib/data";

const accountLinks = [
  { href: "/account", label: "Account Overview" },
  { href: "/account/orders", label: "Your Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account/manage", label: "Login & Security" },
];

const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <nav className="hidden w-full gap-3 md:flex">
        <ThemeSwitcher />
        <UserButton />
        {!forAdmin && <CartButton />}
      </nav>

      <nav className="flex gap-1 md:hidden">
        {!forAdmin && <CartButton />}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="header-button align-middle">
            {session ? (
              <UserRoundCheck className="h-7 w-7" />
            ) : (
              <UserRoundPlus className="h-7 w-7" />
            )}
          </SheetTrigger>

          <SheetContent className="flex flex-col items-start bg-black text-white">
            <SheetHeader className="w-full border-b border-white/15 pb-3">
              <div className="flex items-center justify-between">
                <SheetTitle className="ml-2 text-white">Site Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Mobile navigation menu
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="w-full space-y-3 py-2">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="account" className="border-white/15">
                  <AccordionTrigger className="text-sm font-semibold text-white/95">
                    Account
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2">
                      {session ? (
                        accountLinks.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
                          >
                            {item.label}
                          </Link>
                        ))
                      ) : (
                        <Link
                          href="/sign-in"
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
                        >
                          <LogIn className="h-4 w-4" /> Sign In / Create account
                        </Link>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="navigation" className="border-white/15">
                  <AccordionTrigger className="text-sm font-semibold text-white/95">
                    Navigation
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2">
                      {data.headerMenus.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="preferences" className="border-white/15">
                  <AccordionTrigger className="text-sm font-semibold text-white/95">
                    Preferences
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border border-white/15 p-1">
                      <ThemeSwitcher className="ml-0 w-full justify-between" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
