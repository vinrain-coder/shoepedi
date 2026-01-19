"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
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
import { X, Loader2 } from "lucide-react";

import SelectedFiltersPills from "./selected-filters-pills";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PriceControl from "./price-control";
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
  basePath?: string;
  lockCategory?: boolean;
  lockBrand?: boolean;
  lockTag?: boolean;
};

type FilterKey =
  | "category"
  | "brand"
  | "tag"
  | "color"
  | "size"
  | "price"
  | "rating";

export default function FiltersClient({
  initialParams,
  categories,
  tags,
  brands,
  colors,
  sizes,
  basePath = "/search",
  lockCategory = false,
  lockBrand = false,
  lockTag = false,
}: {
  initialParams: ParamsShape;
  categories: string[];
  tags: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  basePath?: string;
  lockCategory?: boolean;
  lockBrand?: boolean;
  lockTag?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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

  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");

  const dCategorySearch = useDebounce(categorySearch);
  const dBrandSearch = useDebounce(brandSearch);
  const dColorSearch = useDebounce(colorSearch);

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.toLowerCase().includes(dCategorySearch.toLowerCase())
      ),
    [categories, dCategorySearch]
  );

  const filteredBrands = useMemo(
    () =>
      brands.filter((b) =>
        b.toLowerCase().includes(dBrandSearch.toLowerCase())
      ),
    [brands, dBrandSearch]
  );

  const filteredColors = useMemo(
    () =>
      colors.filter((c) =>
        c.toLowerCase().includes(dColorSearch.toLowerCase())
      ),
    [colors, dColorSearch]
  );

  const defaultAccordionValues = useMemo(
    () =>
      [
        current.category !== "all" && "categories",
        current.price !== "all" && "price",
        current.rating !== "all" && "rating",
        current.tag !== "all" && "tags",
        current.brand !== "all" && "brands",
        current.color !== "all" && "colors",
        current.size !== "all" && "sizes",
      ].filter(Boolean) as string[],
    [current]
  );

  const [openAccordions, setOpenAccordions] = useState<string[]>(
    defaultAccordionValues
  );

  // Update local state whenever URL changes
  useEffect(() => {
    setLocal({ ...current });
  }, [searchParams.toString()]);

  // --- Helpers ---
  function buildSearchUrl(params: ParamsShape) {
    const p = new URLSearchParams();
    if (params.q && params.q !== "all") p.set("q", params.q);
    if (!lockCategory && params.category && params.category !== "all") {
      p.set("category", params.category);
    }
    if (!lockBrand && params.brand && params.brand !== "all") {
      p.set("brand", params.brand);
    }
    if (!lockTag && params.tag && params.tag !== "all") {
      p.set("tag", params.tag);
    }

    if (params.color && params.color !== "all") p.set("color", params.color);
    if (params.size && params.size !== "all") p.set("size", params.size);
    if (params.price && params.price !== "all") p.set("price", params.price);
    if (params.rating && params.rating !== "all")
      p.set("rating", params.rating);
    if (params.sort) p.set("sort", params.sort);
    if (params.page) p.set("page", params.page);
    const s = p.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  function updateParam(key: keyof ParamsShape, value: string | undefined) {
    const next: ParamsShape = { ...current, page: "1" };

    if (lockCategory && key === "category") return;
    if (lockBrand && key === "brand") return;
    if (lockTag && key === "tag") return;

    if (!value || value === "all") delete next[key];
    else next[key] = value;

    startTransition(() => {
      router.push(buildSearchUrl(next));
    });
  }

  function handleRemove(key: keyof ParamsShape) {
    updateParam(key, undefined);
  }

  function applyLocalToUrl() {
    const next: ParamsShape = { ...local, page: "1" };
    startTransition(() => {
      router.push(buildSearchUrl(next));
    });
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

    startTransition(() => {
      router.push("/search");
    });
  }

  function applyPriceFromControl(value: string) {
    updateParam("price", value);
    setLocal((s) => ({ ...s, price: value }));
  }

  function useDebounce<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
  }

  // --- Filters content (desktop + mobile scroll) ---

  function FiltersContent() {
    return (
      
        
      <Accordion
        type="multiple"
        value={openAccordions}
        onValueChange={setOpenAccordions}
        className="space-y-4"
      >
        {/* ================= Categories ================= */}
        {!lockCategory && !lockBrand && (
          <AccordionItem value="categories">
            <AccordionTrigger className="font-bold">
              Categories
            </AccordionTrigger>
            <AccordionContent>
              <input
                placeholder="Search categories…"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="mb-2 w-full rounded-md border px-2 py-1 text-sm"
              />

              <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2 pr-1">
                <FilterButton
                  disabled={current.category === "all"}
                  active={current.category === "all"}
                  onClick={() => updateParam("category", "all")}
                >
                  All
                </FilterButton>

                {filteredCategories.map((c) => (
                  <FilterButton
                    key={c}
                    active={current.category === c}
                    onClick={() => updateParam("category", c)}
                  >
                    {c}
                  </FilterButton>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ================= Price ================= */}
        <AccordionItem value="price">
          <AccordionTrigger className="font-bold">Price</AccordionTrigger>
          <AccordionContent>
            <PriceControl
              initialPrice={current.price ?? "all"}
              onApply={applyPriceFromControl}
            />
          </AccordionContent>
        </AccordionItem>

        {/* ================= Rating ================= */}
        <AccordionItem value="rating">
          <AccordionTrigger className="font-bold">
            Customer Review
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                disabled={current.rating === "all"}
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
          </AccordionContent>
        </AccordionItem>

        {/* ================= Tags ================= */}
        {!lockTag && (
          <AccordionItem value="tags">
            <AccordionTrigger className="font-bold">Tags</AccordionTrigger>
            <AccordionContent>
              <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 pr-1">
                <FilterButton
                  disabled={current.tag === "all"}
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
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ================= Brands ================= */}
        {!lockBrand && (
          <AccordionItem value="brands">
            <AccordionTrigger className="font-bold">Brands</AccordionTrigger>
            <AccordionContent>
              <input
                placeholder="Search brands…"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="mb-2 w-full rounded-md border px-2 py-1 text-sm"
              />

              <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2 pr-1">
                <FilterButton
                  disabled={current.brand === "all"}
                  active={current.brand === "all"}
                  onClick={() => updateParam("brand", "all")}
                >
                  All
                </FilterButton>

                {filteredBrands.map((b) => (
                  <FilterButton
                    key={b}
                    active={current.brand === b}
                    onClick={() => updateParam("brand", b)}
                  >
                    {b}
                  </FilterButton>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ================= Colors (WITH SEARCH) ================= */}
        <AccordionItem value="colors">
          <AccordionTrigger className="font-bold">Colors</AccordionTrigger>
          <AccordionContent>
            <input
              placeholder="Search colors…"
              value={colorSearch}
              onChange={(e) => setColorSearch(e.target.value)}
              className="mb-2 w-full rounded-md border px-2 py-1 text-sm"
            />

            <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 pr-1">
              <FilterButton
                disabled={current.color === "all"}
                active={current.color === "all"}
                onClick={() => updateParam("color", "all")}
              >
                All
              </FilterButton>

              {filteredColors.map((c) => (
                <FilterButton
                  key={c}
                  active={current.color === c}
                  onClick={() => updateParam("color", c)}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-muted-foreground"
                    style={{ backgroundColor: c }}
                  />
                  <span>{c}</span>
                </FilterButton>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ================= Sizes ================= */}
        <AccordionItem value="sizes">
          <AccordionTrigger className="font-bold">Sizes</AccordionTrigger>
          <AccordionContent>
            <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 pr-1">
              <FilterButton
                disabled={current.size === "all"}
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    
          
    );
  }

  return (
    <>
      
      {/* Mobile */}
     {isPending && (
  <div className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-md flex items-center justify-center">
    <div className="animate-in fade-in zoom-in-95 duration-150 rounded-xl bg-card px-6 py-5 shadow-lg border flex flex-col items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">
        Updating results…
      </span>
    </div>
  </div>
)}

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



