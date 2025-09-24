import ThemeSwitcher from "@/components/shared/header/theme-switcher";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger className="text-2xl" />
          <div className="hidden sm:flex">
            <Button variant="ghost" size="sm">
              <ThemeSwitcher />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
