"use client";

import { LayoutGrid, PanelLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DEFAULT_PRODUCT_CARD_LAYOUT,
  ProductCardLayout,
} from "./product-card-layout";

const LAYOUT_OPTIONS: Array<{
  value: ProductCardLayout;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { value: "classic", label: "Classic", icon: LayoutGrid },
  { value: "split", label: "Detailed", icon: PanelLeft },
];

export default function ProductLayoutSelector({
  layout,
}: {
  layout: ProductCardLayout;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onLayoutChange = (nextLayout: string) => {
    if (!nextLayout || nextLayout === layout) return;

    const params = new URLSearchParams(searchParams.toString());

    if (nextLayout === DEFAULT_PRODUCT_CARD_LAYOUT) {
      params.delete("layout");
    } else {
      params.set("layout", nextLayout);
    }

    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">View</span>
      <ToggleGroup
        type="single"
        value={layout}
        onValueChange={onLayoutChange}
        className="rounded-md border bg-background p-1"
        aria-label="Choose product card layout"
      >
        {LAYOUT_OPTIONS.map(({ value, label, icon: Icon }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            aria-label={`${label} layout`}
            title={label}
            className="h-8 gap-1.5 px-2.5 text-xs"
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
