import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

function NavigationMenu({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="navigation-menu" className={cn("relative w-full", className)} {...props}>
      {children}
    </div>
  );
}

function NavigationMenuList({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul data-slot="navigation-menu-list" className={cn("flex list-none flex-col gap-1", className)} {...props} />;
}

function NavigationMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
}

const navigationMenuTriggerStyle = cva(
  "inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
);

function NavigationMenuTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), className)} {...props}>
      {children}
    </div>
  );
}

function NavigationMenuContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="navigation-menu-content" className={cn("w-full", className)} {...props} />;
}

function NavigationMenuLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a data-slot="navigation-menu-link" className={cn(className)} {...props} />;
}

function NavigationMenuIndicator() {
  return null;
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
};
