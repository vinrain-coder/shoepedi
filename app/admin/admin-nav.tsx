"use client";

import ThemeSwitcher from "@/components/shared/header/theme-switcher";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

export const AdminNav = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b bg-background">
      {/* Sidebar toggle button */}
      <Button className="size-9 variant-outline" onClick={toggleSidebar}>
        {state === "collapsed" || isMobile ? (
          <PanelLeftIcon className="size-4" />
        ) : (
          <PanelLeftCloseIcon className="size-4" />
        )}
      </Button>

      {/* ThemeSwitcher */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </nav>
  );
};
