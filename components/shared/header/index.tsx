import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/actions/product.actions";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import Sidebar from "./sidebar";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function Header() {
  const categories = await getAllCategories();
  const { site } = await getSetting();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b text-foreground transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xl md:text-2xl hover:opacity-90 transition-opacity"
            >
              <Image
                src={site.logo}
                width={48}
                height={48}
                alt={`${site.name} logo`}
                priority
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="hidden sm:inline-block tracking-tighter uppercase">{site.name}</span>
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <Search categories={categories} siteName={site.name} />
          </div>

          <div className="flex items-center">
            <Menu />
          </div>
        </div>

        <div className="md:hidden block pb-3">
          <Search categories={categories} siteName={site.name} />
        </div>
      </div>

      <div className="hidden md:block border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-11">
          <Sidebar categories={categories} />
          <div className="flex items-center gap-6 ml-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            {data.headerMenus.map((menu) => (
              <Link
                href={menu.href}
                key={menu.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1"
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
