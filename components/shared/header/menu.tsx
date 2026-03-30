"use client";

import { House, MoonStar, Navigation, UserRoundCheck, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CartButton from "./cart-button";
import UserButton from "./user-button";
import ThemeSwitcher from "./theme-switcher";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { SignOutButton } from "../sign-out-button";

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

          <SheetContent className="flex flex-col gap-4 overflow-y-auto">
            <SheetHeader className="w-full border-b pb-3 text-left">
              <SheetTitle className="ml-1 flex items-center gap-2">
                <House className="h-4 w-4" /> Site Menu
              </SheetTitle>
              <SheetDescription className="text-xs">
                Quick access to navigation, account, and appearance settings.
              </SheetDescription>
            </SheetHeader>

            <Accordion type="multiple" defaultValue={["navigation", "account", "appearance"]} className="w-full">
              <AccordionItem value="navigation">
                <AccordionTrigger className="py-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <Navigation className="h-4 w-4" /> Navigation links
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    {[
                      { href: "/", label: "Home" },
                      { href: "/search", label: "Shop all products" },
                      { href: "/categories", label: "Categories" },
                      { href: "/brands", label: "Brands" },
                      { href: "/blogs", label: "Blogs" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        onClick={() => setOpen(false)}
                        className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account">
                <AccordionTrigger className="py-3 text-sm">
                  <span className="font-semibold">Account links</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    {session ? (
                      <>
                        {[
                          { href: "/account", label: "Your account" },
                          { href: "/account/orders", label: "Orders" },
                          { href: "/wishlist", label: "Wishlist" },
                          { href: "/account/reviews", label: "My reviews" },
                          { href: "/account/comments", label: "My comments" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            onClick={() => setOpen(false)}
                            className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div className="pt-2">
                          <SignOutButton />
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/sign-in"
                          onClick={() => setOpen(false)}
                          className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/sign-up"
                          onClick={() => setOpen(false)}
                          className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                        >
                          Create account
                        </Link>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="appearance">
                <AccordionTrigger className="py-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <MoonStar className="h-4 w-4" /> Theme toggle
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ThemeSwitcher className="ml-0 w-full justify-start" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
