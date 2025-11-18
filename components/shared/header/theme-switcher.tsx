"use client";

import { ChevronDownIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useIsMounted from "@/hooks/use-is-mounted";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  const changeTheme = (value: string) => {
    setTheme(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="header-button h-[41px] cursor-pointer ml-6 md:ml-0"
        asChild
      >
        {theme === "dark" && isMounted ? (
          <div className="flex items-center gap-1">
            <Moon className="h-4 w-4" /> Dark <ChevronDownIcon />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Sun className="h-4 w-4" /> Light <ChevronDownIcon />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>

        <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
          <DropdownMenuRadioItem value="dark">
            <Moon className="h-4 w-4 mr-1" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">
            <Sun className="h-4 w-4 mr-1" /> Light
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
