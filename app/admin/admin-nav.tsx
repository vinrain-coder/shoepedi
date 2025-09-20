"use client";

import ThemeSwitcher from "@/components/shared/header/theme-switcher";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

export const AdminNav = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();

  return (
    <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-background">
      <Button className="size-9 variant-outline" onClick={toggleSidebar}>
        {state === "collapsed" || isMobile ? (
          <PanelLeftIcon className="size-4" />
        ) : (
          <PanelLeftCloseIcon className="size-4" />
        )}
      </Button>

      <div className="ml-auto">
        <ThemeSwitcher />
      </div>
    </nav>
  );
};
