import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/actions/product.actions";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import Sidebar from "./sidebar";
import { getSetting } from "@/lib/actions/setting.actions";
import NavbarWishlist from "./nav-wishlist";
import NavbarCompare from "./nav-compare";

export default async function Header() {
  const categories = await getAllCategories();
  const { site } = await getSetting();

  return (
    <header className="bg-black text-white border-b border-white/5">
      <div className="px-4 md:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center hover:bg-white/5 transition-colors rounded-lg p-1 pr-3 font-extrabold text-2xl"
            >
              <Image
                src={site.logo}
                width={50}
                height={50}
                alt={`${site.name} logo`}
                priority
                className="mr-1"
              />
              <span className="hidden sm:block tracking-tighter">
                {site.name}
              </span>
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-2xl mx-4">
            <Search categories={categories} siteName={site.name} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NavbarCompare />
            <NavbarWishlist />
            <Menu />
          </div>
        </div>

        <div className="md:hidden block py-2 mt-2">
          <Search categories={categories} siteName={site.name} />
        </div>
      </div>

      <div className="flex items-center px-4 md:px-8 bg-zinc-900 py-1.5 border-t border-white/5">
        <Sidebar categories={categories} />
        <div className="flex items-center flex-wrap gap-6 overflow-hidden max-h-[42px] ml-4">
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className="text-sm font-medium text-white/80 hover:text-primary hover:bg-white/5 px-2 py-1 rounded-md transition-all"
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
