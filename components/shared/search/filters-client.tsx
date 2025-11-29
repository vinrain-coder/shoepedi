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
        {/* Category */}
        <div>
          <div className="font-bold mb-2">Category</div>
          <ul className="space-y-1">
            <li>
              <button
                className={current.category === "all" ? "text-primary" : ""}
                onClick={() => updateParam("category", "all")}
              >
                All
              </button>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <button
                  className={c === current.category ? "text-primary" : ""}
                  onClick={() => updateParam("category", c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
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
          <ul className="space-y-1">
            <li>
              <button
                className={current.rating === "all" ? "text-primary" : ""}
                onClick={() => updateParam("rating", "all")}
              >
                All
              </button>
            </li>
            <li>
              <button
                className={current.rating === "4" ? "text-primary" : ""}
                onClick={() => updateParam("rating", "4")}
              >
                4 & Up
              </button>
            </li>
          </ul>
        </div>

        {/* Tags */}
        <div>
          <div className="font-bold mb-2">Tags</div>
          <ul className="space-y-1">
            <li>
              <button
                className={current.tag === "all" ? "text-primary" : ""}
                onClick={() => updateParam("tag", "all")}
              >
                All
              </button>
            </li>
            {tags.map((t) => (
              <li key={t}>
                <button
                  className={t === current.tag ? "text-primary" : ""}
                  onClick={() => updateParam("tag", t)}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Brands */}
        <div>
          <div className="font-bold mb-2">Brands</div>
          <ul className="space-y-1">
            <li>
              <button
                className={current.brand === "all" ? "text-primary" : ""}
                onClick={() => updateParam("brand", "all")}
              >
                All
              </button>
            </li>
            {brands.map((b) => (
              <li key={b}>
                <button
                  className={b === current.brand ? "text-primary" : ""}
                  onClick={() => updateParam("brand", b)}
                >
                  {b}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Colors */}
        <div>
          <div className="font-bold mb-2">Colors</div>
          <ul className="space-y-1">
            <li>
              <button
                className={current.color === "all" ? "text-primary" : ""}
                onClick={() => updateParam("color", "all")}
              >
                All
              </button>
            </li>

            {colors.map((c) => (
              <li key={c} className="flex items-center space-x-2">
                <button
                  className={
                    c === current.color
                      ? "text-primary flex items-center space-x-2"
                      : "flex items-center space-x-2"
                  }
                  onClick={() => updateParam("color", c)}
                >
                  {/* 🔵 Color Dot */}
                  <div
                    className="h-5 w-5 rounded-full border border-muted-foreground"
                    style={{ backgroundColor: c }}
                  ></div>

                  {/* Color Name */}
                  <span>{c}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sizes*/}
        <div>
          <div className="font-bold mb-2">Sizes</div>

          <div className="grid grid-cols-3 gap-2">
            {/* All Sizes button */}
            <button
              className={
                current.size === "all"
                  ? "text-primary border px-2 py-1 rounded-full"
                  : "border px-2 py-1 rounded-full"
              }
              onClick={() => updateParam("size", "all")}
            >
              All
            </button>

            {/* Size buttons */}
            {sizes.map((s) => (
              <button
                key={s}
                className={
                  s === current.size
                    ? "text-primary border border-primary px-2 py-1 rounded-full"
                    : "border px-2 py-1 rounded-full"
                }
                onClick={() => updateParam("size", s)}
              >
                {s}
              </button>
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
        <Drawer direction="left" open={open} onOpenChange={setOpen}>
          <div className="flex items-center gap-2 py-2">
            <DrawerTrigger asChild>
              <Button className="rounded-full">Filters</Button>
            </DrawerTrigger>

            <div className="flex-1">
              <SelectedFiltersPills params={current} onRemove={handleRemove} />
            </div>
          </div>

          <DrawerContent className="w-[90vw] max-w-md p-4 shadow-lg">
            <div className="flex flex-col h-full">
              {/* Header */}
              <DrawerHeader className="flex flex-row items-center justify-between p-2 border-b sticky top-0 bg-background z-20">
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost">
                    <X />
                  </Button>
                </DrawerClose>
              </DrawerHeader>

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

                <DrawerClose asChild>
                  <Button className="flex-1" onClick={applyLocalToUrl}>
                    Apply
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
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
