"use client";
import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return { href, label };
  });

  const truncate = (text: string, max = 18) => 
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <nav className="flex items-center text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home size={16} />
        <span>Home</span>
      </Link>
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          <ChevronRight size={16} className="mx-2 text-muted-foreground/50" />
          <Link
            href={crumb.href}
            className={`hover:text-foreground transition-colors ${
              index === crumbs.length - 1 ? "text-foreground font-medium" : ""
            }`}
          >
            {truncate(crumb.label, 18)}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
                              }
