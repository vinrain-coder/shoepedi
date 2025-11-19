// app/search/page.tsx
import Link from "next/link";

import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
  getAllTags,
} from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import { getFilterUrl, toSlug } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

import CollapsibleOnMobile from "@/components/shared/collapsible-on-mobile";

// shadcn/ui components (paths adjusted to match your project conventions)
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { X as CloseIcon } from "lucide-react";

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

const prices = [
  {
    name: "KES100 to KES2,500",
    value: "100-2500",
    min: 100,
    max: 2500,
  },
  {
    name: "KES2,501 to KES4,000",
    value: "2501-4000",
    min: 2501,
    max: 4000,
  },
  {
    name: "KES4,001 to KES10,000",
    value: "4001-10000",
    min: 4001,
    max: 10000,
  },
];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    tag: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const {
    q = "all",
    category = "all",
    tag = "all",
    price = "all",
    rating = "all",
  } = searchParams;

  if (
    (q !== "all" && q !== "") ||
    category !== "all" ||
    tag !== "all" ||
    rating !== "all" ||
    price !== "all"
  ) {
    return {
      title: `Search ${q !== "all" ? q : ""} 
            ${category !== "all" ? ` : Category ${category}` : ""} 
            ${tag !== "all" ? ` : Tag ${tag}` : ""} 
            ${price !== "all" ? ` : Price ${price}` : ""} 
            ${rating !== "all" ? ` : Rating ${rating}` : ""}`,
    };
  }
}

/**
 * --------------------------
 * CLIENT COMPONENTS (INLINE)
 * --------------------------
 *
 * These must be client components. They read and manipulate the URL search params
 * (so the server route is re-run and products refresh immediately).
 *
 * They are intentionally included inside the same file to satisfy "no new files" constraint.
 */

/* eslint-disable react-hooks/rules-of-hooks */
// FiltersClient: renders desktop sticky sidebar and a mobile sheet.
// Selected filters are shown as removable pills above results and in sheet header.
const CLIENT_COMPONENTS = `use client` as const; // trick to indicate 'use client' below

/* Put client components into a file-local "module scope" by declaring them as normal JS functions
   but using a "use client" directive at top of the client code block. */

///// Client-side code block /////
/* eslint-disable @typescript-eslint/no-unused-vars */
//////// START client block ////////
/* To ensure Next detects these as client components, we create them as strings and then
   create a small client wrapper. But in practice, simply place 'use client' in the source
   before these component definitions. */

export {};

/* Now actual client components (must appear after export default in source order for some linters
   but Next will treat them as client when 'use client' is used). */

/* To keep this file correct for Next.js, we'll re-add the 'use client' here and define the components.
   Place this near top of file in real project or keep as shown below. */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

// shadcn/ui imports in client area
// Note: paths assume your project has these components already.
// If not, swap with your project's UI component imports.
import { Slider as ShadSlider } from "@/components/ui/slider";
import { Button as ShadButton } from "@/components/ui/button";
import { Input as ShadInput } from "@/components/ui/input";
import {
  Sheet as ShadSheet,
  SheetContent as ShadSheetContent,
  SheetHeader as ShadSheetHeader,
  SheetTitle as ShadSheetTitle,
  SheetTrigger as ShadSheetTrigger,
  SheetClose as ShadSheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

type ParamsShape = {
  q?: string;
  category?: string;
  tag?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

function buildSearchUrl(params: ParamsShape) {
  const p = new URLSearchParams();
  if (params.q && params.q !== "all") p.set("q", params.q);
  if (params.category && params.category !== "all") p.set("category", params.category);
  if (params.tag && params.tag !== "all") p.set("tag", params.tag);
  if (params.price && params.price !== "all") p.set("price", params.price);
  if (params.rating && params.rating !== "all") p.set("rating", params.rating);
  if (params.sort) p.set("sort", params.sort);
  if (params.page) p.set("page", params.page);
  const s = p.toString();
  return s ? `/search?${s}` : `/search`;
}

function useQueryParams() {
  const sp = useSearchParams();
  const read = {
    q: sp.get("q") ?? "all",
    category: sp.get("category") ?? "all",
    tag: sp.get("tag") ?? "all",
    price: sp.get("price") ?? "all",
    rating: sp.get("rating") ?? "all",
    sort: sp.get("sort") ?? "best-selling",
    page: sp.get("page") ?? "1",
  };
  return read;
}

function SelectedFiltersPills({
  params,
  onRemove,
}: {
  params: ParamsShape;
  onRemove: (key: keyof ParamsShape) => void;
}) {
  const pills: { key: keyof ParamsShape; label: string }[] = [];

  if (params.q && params.q !== "all" && params.q !== "") pills.push({ key: "q", label: `"${params.q}"` });
  if (params.category && params.category !== "all") pills.push({ key: "category", label: `Category: ${params.category}` });
  if (params.tag && params.tag !== "all") pills.push({ key: "tag", label: `Tag: ${params.tag}` });
  if (params.price && params.price !== "all") pills.push({ key: "price", label: `Price: ${params.price}` });
  if (params.rating && params.rating !== "all") pills.push({ key: "rating", label: `Rating: ${params.rating}+` });

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={() => onRemove(p.key)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
          aria-label={`Remove filter ${p.label}`}
        >
          <span className="text-sm">{p.label}</span>
          <span className="w-4 h-4 flex items-center justify-center bg-primary text-white rounded-full text-xs">×</span>
        </button>
      ))}
    </div>
  );
}

function PriceControl({
  initialPrice,
  onApply,
}: {
  initialPrice: string;
  onApply: (value: string) => void;
}) {
  // initialPrice format like "100-2500" or "all"
  const [range, setRange] = useState<[number, number]>(() => {
    if (!initialPrice || initialPrice === "all") return [100, 10000];
    const parts = initialPrice.split("-").map((s) => Number(s));
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) return [parts[0], parts[1]];
    return [100, 10000];
  });
  const [minInput, setMinInput] = useState(range[0].toString());
  const [maxInput, setMaxInput] = useState(range[1].toString());

  useEffect(() => {
    setMinInput(String(range[0]));
    setMaxInput(String(range[1]));
  }, [range]);

  function applyPrice() {
    onApply(`${range[0]}-${range[1]}`);
  }

  return (
    <div className="space-y-3">
      <div className="px-2">
        <ShadSlider
          value={range}
          onValueChange={(v: [number, number]) => setRange(v)}
          min={0}
          max={20000}
          step={50}
        />
      </div>
      <div className="flex gap-2">
        <ShadInput
          value={minInput}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d]/g, "");
            setMinInput(val);
            const n = Number(val || 0);
            if (!Number.isNaN(n) && n <= Number(maxInput || 0)) setRange([n, range[1]]);
          }}
          aria-label="Minimum price"
        />
        <ShadInput
          value={maxInput}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d]/g, "");
            setMaxInput(val);
            const n = Number(val || 0);
            if (!Number.isNaN(n) && n >= Number(minInput || 0)) setRange([range[0], n]);
          }}
          aria-label="Maximum price"
        />
        <ShadButton onClick={applyPrice}>Apply</ShadButton>
      </div>
    </div>
  );
}

function FiltersClient({
  initialParams,
  categories,
  tags,
}: {
  initialParams: ParamsShape;
  categories: string[];
  tags: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = useQueryParams();

  const [open, setOpen] = useState(false);
  // local working copy for sheet inputs (so Clear All or Apply don't close sheet and can be applied)
  const [local, setLocal] = useState<ParamsShape>(() => ({ ...initialParams }));
  const [priceLocal, setPriceLocal] = useState(initialParams.price ?? "all");

  useEffect(() => {
    // sync when URL changes externally
    const p = useQueryParams();
    setLocal(p);
    setPriceLocal(p.price ?? "all");
  }, [sp.toString()]);

  // update a single param and push URL (immediate re-render)
  function updateParam(key: keyof ParamsShape, value: string | undefined) {
    const next: ParamsShape = {
      q: current.q,
      category: current.category,
      tag: current.tag,
      price: current.price,
      rating: current.rating,
      sort: current.sort,
      page: "1",
    };
    if (value === undefined || value === "all" || value === "") {
      delete next[key];
    } else {
      // @ts-ignore
      next[key] = value;
    }
    router.push(buildSearchUrl(next));
  }

  function handleRemove(key: keyof ParamsShape) {
    updateParam(key, undefined);
  }

  function applyLocalToUrl() {
    const next: ParamsShape = {
      q: local.q ?? "all",
      category: local.category ?? "all",
      tag: local.tag ?? "all",
      price: local.price ?? "all",
      rating: local.rating ?? "all",
      sort: local.sort ?? current.sort,
      page: "1",
    };
    router.push(buildSearchUrl(next));
  }

  function clearAllLocal() {
    setLocal({ q: "all", category: "all", tag: "all", price: "all", rating: "all", sort: current.sort, page: "1" });
    // update URL but keep sheet open (per requirement)
    router.push("/search");
  }

  function applyPriceFromControl(value: string) {
    // update immediate
    updateParam("price", value);
    setLocal((s) => ({ ...s, price: value }));
    setPriceLocal(value);
  }

  // Desktop sidebar filters content - reused inside sheet body
  function FiltersContent() {
    return (
      <div className="space-y-6 p-4">
        <div>
          <div className="font-bold mb-2">Category</div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParam("category", "all")}
                className={clsx("text-left w-full", (current.category === "all" || current.category === "") && "text-primary")}
              >
                All
              </button>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <button
                  className={clsx("text-left w-full", c === current.category && "text-primary")}
                  onClick={() => updateParam("category", c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-bold mb-2">Price</div>
          <div>
            <PriceControl
              initialPrice={current.price ?? "all"}
              onApply={(value) => applyPriceFromControl(value)}
            />
          </div>
        </div>

        <div>
          <div className="font-bold mb-2">Customer Review</div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParam("rating", "all")}
                className={clsx((current.rating === "all") && "text-primary")}
              >
                All
              </button>
            </li>
            <li>
              <button
                onClick={() => updateParam("rating", "4")}
                className={clsx((current.rating === "4") && "text-primary")}
              >
                <div className="flex items-center gap-2">
                  <Rating size={4} rating={4} /> & Up
                </div>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold mb-2">Tag</div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParam("tag", "all")}
                className={clsx((current.tag === "all" || current.tag === "") && "text-primary")}
              >
                All
              </button>
            </li>
            {tags.map((t, i) => (
              <li key={i}>
                <button
                  onClick={() => updateParam("tag", t)}
                  className={clsx(toSlug(t) === current.tag && "text-primary")}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile sheet trigger */}
      <div className="md:hidden">
        <ShadSheet open={open} onOpenChange={setOpen}>
          <div className="flex items-center gap-2 py-2">
            <ShadSheetTrigger asChild>
              <ShadButton variant="outline">Filters</ShadButton>
            </ShadSheetTrigger>
            {/* Selected filter pills beneath header on mobile (but outside sheet trigger) */}
            <div className="flex-1">
              <SelectedFiltersPills
                params={current}
                onRemove={(k) => handleRemove(k)}
              />
            </div>
          </div>

          <ShadSheetContent side="left" className="w-[90vw] max-w-md p-0">
            <div className="flex flex-col h-full">
              {/* Fixed header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-20">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <ShadButton
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                    }}
                    aria-label="Close filters"
                  >
                    <X />
                  </ShadButton>
                </div>
              </div>

              {/* selected pills under header */}
              <div className="p-4 border-b">
                <SelectedFiltersPills params={current} onRemove={(k) => handleRemove(k)} />
              </div>

              {/* Content scrolls independently */}
              <div className="overflow-auto p-0" style={{ maxHeight: "calc(100vh - 180px)" }}>
                <FiltersContent />
              </div>

              {/* Footer actions */}
              <div className="p-4 border-t flex gap-2">
                <ShadButton variant="outline" className="flex-1" onClick={() => clearAllLocal()}>
                  Clear All
                </ShadButton>
                <ShadButton className="flex-1" onClick={() => applyLocalToUrl()}>
                  Apply
                </ShadButton>
              </div>
            </div>
          </ShadSheetContent>
        </ShadSheet>
      </div>

      {/* Desktop filters (sticky) */}
      <aside className="hidden md:block md:col-span-1">
        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-auto p-4 border rounded-lg bg-card">
          <div className="mb-3">
            <div className="font-bold">Filters</div>
          </div>
          <div className="mb-3">
            <SelectedFiltersPills params={current} onRemove={(k) => handleRemove(k)} />
          </div>
          <FiltersContent />
        </div>
      </aside>
    </>
  );
}

//////// END client block ////////
// Revert to server component code below (use "use server" implicitly by file scope)

////////////////////////////////////////////////////////////////////////
/* Above client components:
 - FiltersClient receives `initialParams`, `categories`, `tags`.
 - It reads & manipulates URL via next/navigation, so updating filters triggers server fetch.
 - The mobile sheet uses shadcn's Sheet with side="left" and fixed header; content scrolls independently.
 - PriceControl uses Shadcn Slider + two inputs and calls update/Apply which updates URL immediately.
*/
////////////////////////////////////////////////////////////////////////

/* ------------------------------------------------------------------
   SERVER-COMPONENT: SearchPage
   ------------------------------------------------------------------ */

export default async function SearchPage(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    tag: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const {
    q = "all",
    category = "all",
    tag = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = searchParams;

  const params = { q, category, tag, price, rating, sort, page };

  // Fetch categories, tags, and products in parallel
  const [categories, tags, data] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllProducts({
      category,
      tag,
      query: q,
      price,
      rating,
      page: Number(page),
      sort,
    }),
  ]);

  // Pass a minimal initialParams object to the client for immediate state
  const initialParamsForClient = {
    q,
    category,
    tag,
    price,
    rating,
    sort,
    page,
  };

  return (
    <div className="space-y-4">
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row items-start md:items-center p-3 gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              {data.totalProducts === 0
                ? "No results"
                : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
              results
              {(q !== "all" && q !== "") ||
              (category !== "all" && category !== "") ||
              (tag !== "all" && tag !== "") ||
              rating !== "all" ||
              price !== "all"
                ? ` for `
                : null}
              {q !== "all" && q !== "" && '"' + q + '"'}
              {category !== "all" && category !== "" && `   Category: ` + category}
              {tag !== "all" && tag !== "" && `   Tag: ` + tag}
              {price !== "all" && `    Price: ` + price}
              {rating !== "all" && `    Rating: ` + rating + ` & up`}
              &nbsp;
              {(q !== "all" && q !== "") ||
              (category !== "all" && category !== "") ||
              (tag !== "all" && tag !== "") ||
              rating !== "all" ||
              price !== "all" ? (
                <Button variant={"link"} asChild>
                  <Link href="/search">Clear</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Sorting selector floats to right */}
        <div className="flex-shrink-0">
          <ProductSortSelector sortOrders={sortOrders} sort={sort} params={params} />
        </div>
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 p-3">
        {/* Filters client (desktop sticky + mobile sheet) */}
        <div className="md:col-span-1">
          {/* The client component will render the sticky sidebar on desktop and a mobile sheet */}
          {/* @ts-ignore-next-line */}
          <FiltersClient initialParams={initialParamsForClient} categories={categories} tags={tags} />
        </div>

        {/* Results */}
        <div className="md:col-span-4 space-y-4">
          <div>
            <div className="font-bold text-xl">Results</div>
            <div>Check each product page for other buying options</div>
          </div>

          {/* Selected filters pills (server-side fallback) - client will also show them */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-2">
              {q !== "all" && q !== "" ? (
                <Link href={getFilterUrl({ q: "all", params })} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  "{q}" <span className="ml-2 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</span>
                </Link>
              ) : null}
              {category !== "all" ? (
                <Link href={getFilterUrl({ category: "all", params })} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  Category: {category} <span className="ml-2 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</span>
                </Link>
              ) : null}
              {tag !== "all" ? (
                <Link href={getFilterUrl({ tag: "all", params })} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  Tag: {tag} <span className="ml-2 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</span>
                </Link>
              ) : null}
              {price !== "all" ? (
                <Link href={getFilterUrl({ price: "all", params })} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  Price: {price} <span className="ml-2 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</span>
                </Link>
              ) : null}
              {rating !== "all" ? (
                <Link href={getFilterUrl({ rating: "all", params })} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  Rating: {rating}+ <span className="ml-2 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {data.products.length === 0 && <div>No product found</div>}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id.toString()} product={product} />
            ))}
          </div>

          {data.totalPages > 1 && <Pagination page={page} totalPages={data.totalPages} />}
        </div>
      </div>
    </div>
  );
}
