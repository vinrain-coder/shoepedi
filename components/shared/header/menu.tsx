"use client";

import { ChevronRight, House, MoonStar, Navigation, MenuIcon, ShoppingCart, User, Heart, GitCompare } from "lucide-react";
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
import NavbarWishlist from "./nav-wishlist";
import NavbarCompare from "./nav-compare";

const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end items-center gap-2 md:gap-4">
      {/* Desktop Navigation */}
      <nav className="md:flex items-center gap-4 hidden">
        <NavbarCompare />
        <NavbarWishlist />
        <ThemeSwitcher />
        <UserButton />
        {!forAdmin && <CartButton />}
      </nav>

      {/* Mobile Navigation */}
      <nav className="flex items-center gap-1 md:hidden">
        {!forAdmin && <CartButton />}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="p-2 hover:bg-accent rounded-full transition-colors">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <SheetContent side="right" className="flex flex-col gap-6 overflow-y-auto w-[300px] sm:w-[400px]">
            <SheetHeader className="w-full border-b pb-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
                <House className="h-5 w-5 text-primary" /> Navigation
              </SheetTitle>
              <SheetDescription className="text-xs">
                Quick access to navigation, account, and appearance settings.
              </SheetDescription>
            </SheetHeader>

            <Accordion type="multiple" defaultValue={["navigation", "account", "appearance"]} className="w-full border-none">
              <AccordionItem value="appearance" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center gap-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                    <MoonStar className="h-4 w-4" /> Appearance
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ThemeSwitcher className="ml-0 w-full justify-start rounded-xl bg-muted/30 hover:bg-muted/50 p-4 transition-colors" />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="navigation" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center gap-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                    <Navigation className="h-4 w-4" /> Quick Links
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { href: "/", label: "Home", icon: House },
                      { href: "/search", label: "Shop All", icon: ShoppingCart },
                      { href: "/compare", label: "Compare", icon: GitCompare },
                      { href: "/wishlist", label: "Wishlist", icon: Heart },
                      { href: "/blogs", label: "Our Blog", icon: ChevronRight },
                      { href: "/track", label: "Track Order", icon: ChevronRight },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-accent hover:pl-6"
                      >
                        {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center gap-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">
                    <User className="h-4 w-4" /> My Account
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2">
                    {session ? (
                      <>
                        {[
                          { href: "/account", label: "Personal Info" },
                          { href: "/account/orders", label: "Order History" },
                          { href: "/account/reviews", label: "My Reviews" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-accent hover:pl-6"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                          </Link>
                        ))}
                        <div className="pt-4 mt-2 border-t">
                          <SignOutButton />
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 pt-2">
                        <Link
                          href="/sign-in"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/sign-up"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center rounded-xl border-2 border-primary px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
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
