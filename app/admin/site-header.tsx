import ThemeSwitcher from "@/components/shared/header/theme-switcher";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 !w-[32px] !h-[32px]" />
        <div className="flex ml-auto">
          <Button variant="ghost" size="sm">
            <ThemeSwitcher />
          </Button>
        </div>
      </div>
    </header>
  );
}
