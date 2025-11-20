"use client";

import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect } from "react";

/**
 * Professional Dynamic Global Breadcrumb with JSON-LD
 * - Generates clickable breadcrumb trail
 * - Builds SEO schema.org BreadcrumbList dynamically
 * - Works across all routes (categories, products, etc.)
 */

export default function Breadcrumb() {
  const pathname = usePathname();

  // Split current route into segments
  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  // Build breadcrumb data
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return { href, label };
  });

  // Generate structured data for SEO
  useEffect(() => {
    const itemList = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${window.location.origin}/`,
      },
      ...crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.label,
        item: `${window.location.origin}${crumb.href}`,
      })),
    ];

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: itemList,
    });

    // Remove old structured data if present
    document
      .querySelectorAll('script[type="application/ld+json"][data-breadcrumb]')
      .forEach((el) => el.remove());

    script.setAttribute("data-breadcrumb", "true");
    document.head.appendChild(script);

    return () => script.remove();
  }, [pathname]);
  
  const truncate = (text: string, max = 18) => {
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  return (
    <nav
      className="flex items-center text-sm text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home size={16} />
        <span>Home</span>
      </Link>

      {crumbs.length > 0 && (
        <span className="mx-2 text-muted-foreground/50">/</span>
      )}

      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          <Link
            href={crumb.href}
            className={`hover:text-foreground transition-colors ${
              index === crumbs.length - 1 ? "text-foreground font-medium" : ""
            }`}
          >
            {truncate(crumb.label, 18)}
          </Link>

          {index < crumbs.length - 1 && (
            <ChevronRight size={16} className="mx-2 text-muted-foreground/50" />
          )}
        </Fragment>
      ))}
    </nav>
  );
}
