"use client";

import { LayoutGrid, PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  isProductCardLayout,
  ProductCardLayout,
} from "./product-card-layout";

const PRODUCT_LAYOUT_STORAGE_KEY = "product_card_layout";

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
  const [selectedLayout, setSelectedLayout] = useState<ProductCardLayout>(layout);

  useEffect(() => {
    const savedLayout = window.localStorage.getItem(PRODUCT_LAYOUT_STORAGE_KEY);
    if (savedLayout && isProductCardLayout(savedLayout)) {
      setSelectedLayout(savedLayout);
      window.dispatchEvent(
        new CustomEvent("product-layout-change", { detail: savedLayout })
      );
    }
  }, []);

  const onLayoutChange = (nextLayout: string) => {
    if (!nextLayout || !isProductCardLayout(nextLayout)) return;
    setSelectedLayout(nextLayout);
    window.localStorage.setItem(PRODUCT_LAYOUT_STORAGE_KEY, nextLayout);
    window.dispatchEvent(
      new CustomEvent("product-layout-change", { detail: nextLayout })
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">View</span>
      <ToggleGroup
        type="single"
        value={selectedLayout}
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
