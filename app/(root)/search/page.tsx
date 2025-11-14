"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import Rating from "@/components/shared/product/rating";

import {
  getAllCategories,
  getAllProducts,
  getAllTags,
} from "@/lib/actions/product.actions";

import { toSlug } from "@/lib/utils";
import { IProduct } from "@/lib/db/models/product.model";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

// Sorting options
const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -----------------------
  // INITIAL FILTER STATE
  // -----------------------
  const [q, setQ] = useState(searchParams.get("q") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [tag, setTag] = useState(searchParams.get("tag") || "all");
  const [rating, setRating] = useState(searchParams.get("rating") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "best-selling");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const defaultPriceRange: [number, number] = [0, 10000];
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const p = searchParams.get("price");
    if (!p) return defaultPriceRange;
    const [a, b] = p.split("-").map(Number);
    return [a || 0, b || 10000];
  });

  const [minPriceInput, setMinPriceInput] = useState(priceRange[0]);
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange[1]);

  const [sheetOpen, setSheetOpen] = useState(false);

  // -----------------------
  // REMOTE DATA
  // -----------------------
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fromTo, setFromTo] = useState({ from: 0, to: 0 });

  const buildParams = useCallback(() => {
    return {
      q,
      category,
      tag,
      rating,
      price: `${priceRange[0]}-${priceRange[1]}`,
      sort,
      page: page.toString(),
    };
  }, [q, category, tag, rating, priceRange, sort, page]);

  // -----------------------
  // URL SYNC
  // -----------------------
  const syncUrl = useCallback(() => {
    const p = buildParams();
    const query = new URLSearchParams();

    Object.entries(p).forEach(([key, value]) => {
      if (value !== "all" && value !== "0-10000") query.set(key, value);
    });

    router.replace(`/search?${query.toString()}`, { scroll: false });
  }, [router, buildParams]);

  // -----------------------
  // DEBOUNCED FETCH
  // -----------------------
  const fetchData = useCallback(async () => {
    const [cats, tgs, data] = await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllProducts(buildParams()),
    ]);

    setCategories(cats);
    setTags(tgs);
    setProducts(data.products);
    setTotalProducts(data.totalProducts);
    setTotalPages(data.totalPages);
    setFromTo({ from: data.from, to: data.to });
  }, [buildParams]);

  useEffect(() => {
    syncUrl();
    const timeout = setTimeout(fetchData, 200); // ⚡ debounce for massive speed
    return () => clearTimeout(timeout);
  }, [syncUrl, fetchData]);

  // -----------------------
  // FILTER HANDLERS
  // -----------------------
  const handleFilterChange = (filter: string, value: any) => {
    if (filter === "category") setCategory(value);
    if (filter === "tag") setTag(value);
    if (filter === "rating") setRating(value);
    setPage(1);
  };

  const handlePriceApply = () => {
    setPriceRange([minPriceInput, maxPriceInput]);
    setPage(1);
  };

  const handleClearAll = () => {
    setQ("all");
    setCategory("all");
    setTag("all");
    setRating("all");
    setPriceRange(defaultPriceRange);
    setMinPriceInput(defaultPriceRange[0]);
    setMaxPriceInput(defaultPriceRange[1]);
    setPage(1);
  };

  // -----------------------
  // SELECTED FILTER PILLS
  // -----------------------
  const selectedFilters = useMemo(() => {
    const arr: string[] = [];

    if (category !== "all") arr.push(`Category: ${category}`);
    if (tag !== "all") arr.push(`Tag: ${tag}`);
    if (rating !== "all") arr.push(`Rating: ${rating}+`);
    if (priceRange[0] !== 0 || priceRange[1] !== 10000)
      arr.push(`Price: ${priceRange[0]}-${priceRange[1]}`);

    return arr;
  }, [category, tag, rating, priceRange]);

  return (
    <div>
      {/* --------------------------- */}
      {/* RESULTS HEADER */}
      {/* --------------------------- */}
      <div className="my-2 bg-card flex flex-col md:flex-row items-start md:items-center justify-between py-1 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <div>
            {totalProducts === 0
              ? "No results"
              : `${fromTo.from}-${fromTo.to} of ${totalProducts} results`}
          </div>

          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((f, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (f.includes("Category")) setCategory("all");
                    else if (f.includes("Tag")) setTag("all");
                    else if (f.includes("Rating")) setRating("all");
                    else setPriceRange(defaultPriceRange);
                  }}
                >
                  {f} ×
                </Button>
              ))}

              <Button variant="link" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        <div className="mt-2 md:mt-0">
          <ProductSortSelector sortOrders={sortOrders} sort={sort} params={buildParams()} />
        </div>
      </div>

      <div className="bg-card md:grid md:grid-cols-5 md:gap-4">
        {/* --------------------------- */}
        {/* DESKTOP FILTERS */}
        {/* --------------------------- */}
        <div className="hidden md:block sticky top-20 h-fit p-2 space-y-5 border-r">

          {/* CATEGORY */}
          <div>
            <div className="font-bold mb-1">Category</div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleFilterChange("category", "all")}
                  className={category === "all" ? "text-primary" : ""}
                >
                  All
                </button>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => handleFilterChange("category", c)}
                    className={c === category ? "text-primary" : ""}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* PRICE */}
          <div>
            <div className="font-bold mb-1">Price</div>
            <Slider
              value={priceRange}
              min={0}
              max={10000}
              step={100}
              onValueChange={(v) => {
                setMinPriceInput(v[0]);
                setMaxPriceInput(v[1]);
                setPriceRange(v as [number, number]);
              }}
            />

            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(Number(e.target.value))}
              />
              <Input
                type="number"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(Number(e.target.value))}
              />
              <Button size="sm" onClick={handlePriceApply}>
                Apply
              </Button>
            </div>
          </div>

          {/* RATING */}
          <div>
            <div className="font-bold mb-1">Customer Review</div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleFilterChange("rating", "all")}
                  className={rating === "all" ? "text-primary" : ""}
                >
                  All
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFilterChange("rating", "4")}
                  className={rating === "4" ? "text-primary" : ""}
                >
                  <div className="flex items-center">
                    <Rating size={4} rating={4} /> & Up
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* TAG */}
          <div>
            <div className="font-bold mb-1">Tag</div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleFilterChange("tag", "all")}
                  className={tag === "all" ? "text-primary" : ""}
                >
                  All
                </button>
              </li>
              {tags.map((t, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleFilterChange("tag", toSlug(t))}
                    className={toSlug(t) === tag ? "text-primary" : ""}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --------------------------- */}
        {/* MOBILE SHEET FILTERS */}
        {/* --------------------------- */}
        <div className="md:hidden p-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">Filters</Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[85%] p-0"
            >
              {/* FIXED HEADER */}
              <SheetHeader className="bg-card p-4 sticky top-0 border-b z-20">
                <div className="flex justify-between items-center">
                  <SheetTitle>{totalProducts} results</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost">✕</Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              {/* SCROLL CONTENT */}
              <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 70px)" }}>
                {/* SELECTED FILTERS */}
                {selectedFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedFilters.map((f, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          if (f.includes("Category")) setCategory("all");
                          else if (f.includes("Tag")) setTag("all");
                          else if (f.includes("Rating")) setRating("all");
                          else setPriceRange(defaultPriceRange);
                        }}
                      >
                        {f} ×
                      </Button>
                    ))}
                  </div>
                )}

                {/* CATEGORY */}
                <div className="mb-4">
                  <div className="font-bold mb-2">Category</div>
                  {categories.map((c) => (
                    <div key={c}>
                      <button
                        className={`py-1 ${c === category ? "text-primary" : ""}`}
                        onClick={() => handleFilterChange("category", c)}
                      >
                        {c}
                      </button>
                    </div>
                  ))}
                </div>

                {/* PRICE */}
                <div className="mb-4">
                  <div className="font-bold mb-2">Price</div>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={(v) => {
                      setPriceRange(v as [number, number]);
                      setMinPriceInput(v[0]);
                      setMaxPriceInput(v[1]);
                    }}
                  />

                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                    />
                    <Button size="sm" onClick={handlePriceApply}>
                      Apply
                    </Button>
                  </div>
                </div>

                {/* RATING */}
                <div className="mb-4">
                  <div className="font-bold mb-2">Customer Review</div>
                  <button
                    onClick={() => handleFilterChange("rating", "all")}
                    className={rating === "all" ? "text-primary" : ""}
                  >
                    All
                  </button>

                  <button
                    onClick={() => handleFilterChange("rating", "4")}
                    className={`block mt-2 ${rating === "4" ? "text-primary" : ""}`}
                  >
                    <div className="flex items-center">
                      <Rating size={4} rating={4} /> & Up
                    </div>
                  </button>
                </div>

                {/* TAG */}
                <div className="mb-6">
                  <div className="font-bold mb-2">Tag</div>
                  {tags.map((t, i) => (
                    <div key={i}>
                      <button
                        className={`py-1 ${toSlug(t) === tag ? "text-primary" : ""}`}
                        onClick={() => handleFilterChange("tag", toSlug(t))}
                      >
                        {t}
                      </button>
                    </div>
                  ))}
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleClearAll}>
                    Clear All
                  </Button>

                  <SheetClose asChild>
                    <Button>Apply</Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* --------------------------- */}
        {/* PRODUCT GRID */}
        {/* --------------------------- */}
        <div className="md:col-span-4 space-y-4 p-0">
          <div>
            <div className="font-bold text-xl">Results</div>
            <div>Check each product page for other buying options</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.length === 0 && <div>No product found</div>}

            {products.map((p) => (
              <ProductCard key={p._id.toString()} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} />
          )}
        </div>
      </div>
    </div>
  );
  }
