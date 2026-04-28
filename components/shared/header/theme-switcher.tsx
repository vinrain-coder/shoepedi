"use client";

import { Check, ChevronDownIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import useIsMounted from "@/hooks/use-is-mounted";
import { cn } from "@/lib/utils";

export default function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  const isDark = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="ml-6 md:ml-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted/50 transition-colors">
          {isMounted ? (
            isDark ? (
              <>
                <Moon className="h-4 w-4" />
                <span className="text-sm">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span className="text-sm">Light</span>
              </>
            )
          ) : (
            <span className="text-sm">Theme</span>
          )}

          <ChevronDownIcon className="h-4 w-4 opacity-60" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2">
          Choose theme
        </DropdownMenuLabel>

        {/* LIGHT */}
        <DropdownMenuItem
          onSelect={() => setTheme("light")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === "light" && (
            <span className="ml-auto">
              <Check className="h-4 w-4" />
            </span>
          )}
        </DropdownMenuItem>

        {/* DARK */}
        <DropdownMenuItem
          onSelect={() => setTheme("dark")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === "dark" && (
            <span className="ml-auto">
              <Check className="h-4 w-4" />
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
