"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { X } from "lucide-react";

import PriceControl from "./PriceControl";
import SelectedFiltersPills from "./SelectedFiltersPills";
import { toSlug, getFilterUrl } from "@/lib/utils";

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
  return {
    q: sp.get("q") ?? "all",
    category: sp.get("category") ?? "all",
    tag: sp.get("tag") ?? "all",
    price: sp.get("price") ?? "all",
    rating: sp.get("rating") ?? "all",
    sort: sp.get("sort") ?? "best-selling",
    page: sp.get("page") ?? "1",
  };
}

export default function FiltersClient({
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
  const [local, setLocal] = useState<ParamsShape>({ ...initialParams });
  const [priceLocal, setPriceLocal] = useState(initialParams.price ?? "all");

  useEffect(() => {
    const p = useQueryParams();
    setLocal(p);
    setPriceLocal(p.price ?? "all");
  }, [sp.toString()]);

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
    if (!value || value === "all") delete next[key];
    else next[key] = value;
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
    router.push("/search");
  }

  function applyPriceFromControl(value: string) {
    updateParam("price", value);
    setLocal((s) => ({ ...s, price: value }));
    setPriceLocal(value);
  }

  function FiltersContent() {
    return (
      <div className="space-y-6 p-4">
        <div>
          <div className="font-bold mb-2">Category</div>
          <ul className="space-y-1">
            <li><button className={current.category === "all" ? "text-primary" : ""} onClick={() => updateParam("category", "all")}>All</button></li>
            {categories.map((c) => (
              <li key={c}><button className={c === current.category ? "text-primary" : ""} onClick={() => updateParam("category", c)}>{c}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-bold mb-2">Price</div>
          <PriceControl initialPrice={current.price ?? "all"} onApply={applyPriceFromControl} />
        </div>

        <div>
          <div className="font-bold mb-2">Customer Review</div>
          <ul className="space-y-1">
            <li><button className={current.rating === "all" ? "text-primary" : ""} onClick={() => updateParam("rating", "all")}>All</button></li>
            <li><button className={current.rating === "4" ? "text-primary" : ""} onClick={() => updateParam("rating", "4")}>4 & Up</button></li>
          </ul>
        </div>

        <div>
          <div className="font-bold mb-2">Tag</div>
          <ul className="space-y-1">
            <li><button className={current.tag === "all" ? "text-primary" : ""} onClick={() => updateParam("tag", "all")}>All</button></li>
            {tags.map((t, i) => (
              <li key={i}><button className={toSlug(t) === current.tag ? "text-primary" : ""} onClick={() => updateParam("tag", t)}>{t}</button></li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="flex items-center gap-2 py-2">
            <SheetTrigger asChild>
              <Button variant="outline">Filters</Button>
            </SheetTrigger>
            <div className="flex-1">
              <SelectedFiltersPills params={current} onRemove={handleRemove} />
            </div>
          </div>
          <SheetContent side="left" className="w-[90vw] max-w-md p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-20">
                <SheetTitle>Filters</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost"><X /></Button>
                </SheetClose>
              </div>
              <div className="p-4 border-b">
                <SelectedFiltersPills params={current} onRemove={handleRemove} />
              </div>
              <div className="overflow-auto p-0" style={{ maxHeight: "calc(100vh - 180px)" }}>
                <FiltersContent />
              </div>
              <div className="p-4 border-t flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearAllLocal}>Clear All</Button>
                <Button className="flex-1" onClick={applyLocalToUrl}>Apply</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sticky sidebar */}
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
                                            
