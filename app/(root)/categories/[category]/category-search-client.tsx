"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

import PriceControl from "./price-control";
import SelectedFiltersPills from "./selected-filters-pills";
import { toSlug } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DialogOverlay } from "@/components/ui/dialog";
import FilterButton from "./filter-button";

type ParamsShape = {
  q?: string;
  category?: string;
  tag?: string;
  brand?: string;
  color?: string;
  size?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

export default function FiltersClient({
  initialParams,
  categories,
  tags,
  brands,
  colors,
  sizes,
}: {
  initialParams: ParamsShape;
  categories: string[];
  tags: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Current URL parameters ---
  const current: ParamsShape = {
    q: searchParams.get("q") ?? "all",
    category: searchParams.get("category") ?? "all",
    tag: searchParams.get("tag") ?? "all",
    brand: searchParams.get("brand") ?? "all",
    color: searchParams.get("color") ?? "all",
    size: searchParams.get("size") ?? "all",
    price: searchParams.get("price") ?? "all",
    rating: searchParams.get("rating") ?? "all",
    sort: searchParams.get("sort") ?? "best-selling",
    page: searchParams.get("page") ?? "1",
  };

  const [open, setOpen] = useState(false);

  const [local, setLocal] = useState<ParamsShape>({ ...current });

  // Update local state whenever URL changes
  useEffect(() => {
    setLocal({ ...current });
  }, [searchParams.toString()]);

  // --- Helpers ---
  function buildSearchUrl(params: ParamsShape) {
    const p = new URLSearchParams();
    if (params.q && params.q !== "all") p.set("q", params.q);
    if (params.category && params.category !== "all")
      p.set("category", params.category);
    if (params.tag && params.tag !== "all") p.set("tag", params.tag);
    if (params.brand && params.brand !== "all") p.set("brand", params.brand);
    if (params.color && params.color !== "all") p.set("color", params.color);
    if (params.size && params.size !== "all") p.set("size", params.size);
    if (params.price && params.price !== "all") p.set("price", params.price);
    if (params.rating && params.rating !== "all")
      p.set("rating", params.rating);
    if (params.sort) p.set("sort", params.sort);
    if (params.page) p.set("page", params.page);
    const s = p.toString();
    return s ? `/search?${s}` : `/search`;
  }

  function updateParam(key: keyof ParamsShape, value: string | undefined) {
    const next: ParamsShape = { ...current, page: "1" };
    if (!value || value === "all") delete next[key];
    else next[key] = value;
    router.push(buildSearchUrl(next));
  }

  function handleRemove(key: keyof ParamsShape) {
    updateParam(key, undefined);
  }

  function applyLocalToUrl() {
    const next: ParamsShape = { ...local, page: "1" };
    router.push(buildSearchUrl(next));
  }

  function clearAllLocal() {
    setLocal({
      q: "all",
      category: "all",
      tag: "all",
      brand: "all",
      color: "all",
      size: "all",
      price: "all",
      rating: "all",
      sort: current.sort,
      page: "1",
    });
    router.push("/search");
  }

  function applyPriceFromControl(value: string) {
    updateParam("price", value);
    setLocal((s) => ({ ...s, price: value }));
  }

  // --- Filters content (desktop + mobile scroll) ---
  function FiltersContent() {
    return (
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <div className="font-bold mb-2">Categories</div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={current.category === "all"}
              onClick={() => updateParam("category", "all")}
            >
              All
            </FilterButton>

            {categories.map((c) => (
              <FilterButton
                key={c}
                active={current.category === c}
                onClick={() => updateParam("category", c)}
              >
                {c}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="font-bold mb-2">Price</div>
          <PriceControl
            initialPrice={current.price ?? "all"}
            onApply={applyPriceFromControl}
          />
        </div>

        {/* Rating */}

        <div>
          <div className="font-bold mb-2">Customer Review</div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={current.rating === "all"}
              onClick={() => updateParam("rating", "all")}
            >
              All
            </FilterButton>

            <FilterButton
              active={current.rating === "4"}
              onClick={() => updateParam("rating", "4")}
            >
              4 & Up
            </FilterButton>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="font-bold mb-2">Tags</div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={current.tag === "all"}
              onClick={() => updateParam("tag", "all")}
            >
              All
            </FilterButton>

            {tags.map((t) => (
              <FilterButton
                key={t}
                active={current.tag === t}
                onClick={() => updateParam("tag", t)}
              >
                {t}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <div className="font-bold mb-2">Brands</div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={current.brand === "all"}
              onClick={() => updateParam("brand", "all")}
            >
              All
            </FilterButton>

            {brands.map((b) => (
              <FilterButton
                key={b}
                active={current.brand === b}
                onClick={() => updateParam("brand", b)}
              >
                {b}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <div className="font-bold mb-2">Colors</div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={current.color === "all"}
              onClick={() => updateParam("color", "all")}
            >
              All
            </FilterButton>

            {colors.map((c) => (
              <FilterButton
                key={c}
                active={current.color === c}
                onClick={() => updateParam("color", c)}
                className="flex items-center gap-2"
              >
                {/* Color dot */}
                <span
                  className="h-4 w-4 rounded-full border border-muted-foreground"
                  style={{ backgroundColor: c }}
                />

                {/* Color name */}
                <span>{c}</span>
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <div className="font-bold mb-2">Sizes</div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={current.size === "all"}
              onClick={() => updateParam("size", "all")}
            >
              All
            </FilterButton>

            {sizes.map((s) => (
              <FilterButton
                key={s}
                active={current.size === s}
                onClick={() => updateParam("size", s)}
              >
                {s}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden mb-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="flex items-center gap-2 py-2">
            <SheetTrigger asChild>
              <Button className="rounded-full">Filters</Button>
            </SheetTrigger>

            <div className="flex-1">
              <SelectedFiltersPills params={current} onRemove={handleRemove} />
            </div>
          </div>

          <SheetContent className="p-4 shadow-lg !w-[90vw]">
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="flex flex-row items-center justify-between px-2 border-b sticky top-0 bg-background z-20">
                <SheetTitle>Filters</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost">
                    <X />
                  </Button>
                </SheetClose>
              </SheetHeader>

              {/* Selected filters */}
              <div className="p-4 shadow-xs">
                <SelectedFiltersPills
                  params={current}
                  onRemove={handleRemove}
                />
              </div>

              {/* Filters content */}
              <div
                className="overflow-auto p-0"
                style={{ maxHeight: "calc(100vh - 180px)" }}
              >
                <FiltersContent />
              </div>

              {/* Footer buttons */}
              <div className="p-2 flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearAllLocal}
                >
                  Clear All
                </Button>

                <SheetClose asChild>
                  <Button className="flex-1" onClick={applyLocalToUrl}>
                    View Results
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className="hidden md:block md:col-span-1">
        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-auto p-4 border rounded-lg bg-card">
          <div className="mb-3">
            <div className="font-bold">Filters</div>
          </div>
          <div className="mb-3">
            <SelectedFiltersPills params={current} onRemove={handleRemove} />
          </div>
          <FiltersContent />
        </div>
      </aside>
    </>
  );
  }
