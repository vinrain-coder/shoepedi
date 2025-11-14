"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import Rating from "@/components/shared/product/rating";
import CollapsibleOnMobile from "@/components/shared/collapsible-on-mobile";

import { getAllCategories, getAllProducts, getAllTags } from "@/lib/actions/product.actions";
import { getFilterUrl, toSlug } from "@/lib/utils";
import { IProduct } from "@/lib/db/models/product.model";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

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

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fromTo, setFromTo] = useState({ from: 0, to: 0 });

  // Filter states
  const [q, setQ] = useState(searchParams.get("q") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [tag, setTag] = useState(searchParams.get("tag") || "all");
  const [rating, setRating] = useState(searchParams.get("rating") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "best-selling");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minPriceInput, setMinPriceInput] = useState(0);
  const [maxPriceInput, setMaxPriceInput] = useState(10000);

  // Sheet open state (mobile)
  const [sheetOpen, setSheetOpen] = useState(false);

  const params = { q, category, tag, price: `${priceRange[0]}-${priceRange[1]}`, rating, sort, page: page.toString() };

  // Fetch categories, tags, products
  const fetchData = async () => {
    const [cats, tgs, data] = await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllProducts({
        category,
        tag,
        query: q,
        price: `${priceRange[0]}-${priceRange[1]}`,
        rating,
        page,
        sort,
      }),
    ]);
    setCategories(cats);
    setTags(tgs);
    setProducts(data.products);
    setTotalProducts(data.totalProducts);
    setTotalPages(data.totalPages);
    setFromTo({ from: data.from, to: data.to });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, tag, rating, priceRange, sort, page]);

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "category") setCategory(value);
    if (filter === "tag") setTag(value);
    if (filter === "rating") setRating(value);
    setPage(1);
  };

  const handleClearFilter = (filter: string) => {
    handleFilterChange(filter, "all");
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
    setPriceRange([0, 10000]);
    setMinPriceInput(0);
    setMaxPriceInput(10000);
    setPage(1);
  };

  return (
    <div>
      {/* Results header */}
      <div className="my-2 bg-card flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <div>
            {totalProducts === 0 ? "No results" : `${fromTo.from}-${fromTo.to} of ${totalProducts} results`}
            {(q !== "all" && q !== "") ||
            category !== "all" ||
            tag !== "all" ||
            rating !== "all" ||
            priceRange[0] > 0 ||
            priceRange[1] < 10000
              ? " for "
              : null}
            {q !== "all" && q !== "" && `"${q}"`}
          </div>

          {/* Selected filters pills */}
          {[category !== "all" && category, tag !== "all" && tag, rating !== "all" && `${rating}+`, ...(priceRange[0] > 0 || priceRange[1] < 10000 ? [`${priceRange[0]}-${priceRange[1]}`] : [])]
            .filter(Boolean)
            .map((f, idx) => (
              <Button key={idx} variant="outline" size="sm" onClick={() => {
                if (f === category) handleClearFilter("category");
                else if (f === tag) handleClearFilter("tag");
                else if (f === rating) handleClearFilter("rating");
                else setPriceRange([0, 10000]);
              }}>
                {f} ×
              </Button>
            ))}

          {(category !== "all" || tag !== "all" || rating !== "all" || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <Button variant="link" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          )}
        </div>

        {/* Sorting */}
        <div className="mt-2 md:mt-0">
          <ProductSortSelector sortOrders={sortOrders} sort={sort} params={params} />
        </div>
      </div>

      <div className="bg-card md:grid md:grid-cols-5 md:gap-4">
        {/* Desktop filters */}
        <div className="hidden md:block sticky top-20 p-2 space-y-4">
          <div>
            <div className="font-bold">Category</div>
            <ul className="space-y-1">
              <li>
                <Link className={`${category === "all" && "text-primary"}`} href={getFilterUrl({ category: "all", params })}>
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link className={`${c === category && "text-primary"}`} href={getFilterUrl({ category: c, params })}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold">Price</div>
            <div className="space-y-2">
              <Slider
                value={priceRange}
                min={0}
                max={10000}
                step={100}
                onValueChange={(val) => setPriceRange(val as [number, number])}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(Number(e.target.value))}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                  placeholder="Max"
                />
                <Button size="sm" onClick={handlePriceApply}>
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold">Customer Review</div>
            <ul className="space-y-1">
              <li>
                <Link className={`${rating === "all" && "text-primary"}`} href={getFilterUrl({ rating: "all", params })}>
                  All
                </Link>
              </li>
              <li>
                <Link className={`${rating === "4" && "text-primary"}`} href={getFilterUrl({ rating: "4", params })}>
                  <div className="flex items-center">
                    <Rating size={4} rating={4} /> & Up
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold">Tag</div>
            <ul className="space-y-1">
              <li>
                <Link className={`${tag === "all" && "text-primary"}`} href={getFilterUrl({ tag: "all", params })}>
                  All
                </Link>
              </li>
              {tags.map((t, i) => (
                <li key={i}>
                  <Link className={`${toSlug(t) === tag && "text-primary"}`} href={getFilterUrl({ tag: t, params })}>
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile filters */}
        <div className="md:hidden p-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>Filters</Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] p-4">
              <SheetHeader className="flex justify-between items-center sticky top-0 bg-card z-10 p-2">
                <SheetTitle>Filters</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost">✕</Button>
                </SheetClose>
              </SheetHeader>

              <div className="mt-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
                {/* Selected filters pills */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[category !== "all" && category, tag !== "all" && tag, rating !== "all" && `${rating}+`, ...(priceRange[0] > 0 || priceRange[1] < 10000 ? [`${priceRange[0]}-${priceRange[1]}`] : [])]
                    .filter(Boolean)
                    .map((f, idx) => (
                      <Button key={idx} variant="outline" size="sm" onClick={() => {
                        if (f === category) handleClearFilter("category");
                        else if (f === tag) handleClearFilter("tag");
                        else if (f === rating) handleClearFilter("rating");
                        else setPriceRange([0, 10000]);
                      }}>
                        {f} ×
                      </Button>
                    ))}
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <div>
                    <div className="font-bold">Category</div>
                    <ul className="space-y-1">
                      <li>
                        <Link className={`${category === "all" && "text-primary"}`} href={getFilterUrl({ category: "all", params })}>
                          All
                        </Link>
                      </li>
                      {categories.map((c) => (
                        <li key={c}>
                          <Link className={`${c === category && "text-primary"}`} href={getFilterUrl({ category: c, params })}>
                            {c}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-bold">Price</div>
                    <div className="space-y-2">
                      <Slider
                        value={priceRange}
                        min={0}
                        max={10000}
                        step={100}
                        onValueChange={(val) => setPriceRange(val as [number, number])}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(Number(e.target.value))}
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                          placeholder="Max"
                        />
                        <Button size="sm" onClick={handlePriceApply}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">Customer Review</div>
                    <ul className="space-y-1">
                      <li>
                        <Link className={`${rating === "all" && "text-primary"}`} href={getFilterUrl({ rating: "all", params })}>
                          All
                        </Link>
                      </li>
                      <li>
                        <Link className={`${rating === "4" && "text-primary"}`} href={getFilterUrl({ rating: "4", params })}>
                          <div className="flex items-center">
                            <Rating size={4} rating={4} /> & Up
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-bold">Tag</div>
                    <ul className="space-y-1">
                      <li>
                        <Link className={`${tag === "all" && "text-primary"}`} href={getFilterUrl({ tag: "all", params })}>
                          All
                        </Link>
                      </li>
                      {tags.map((t, i) => (
                        <li key={i}>
                          <Link className={`${toSlug(t) === tag && "text-primary"}`} href={getFilterUrl({ tag: t, params })}>
                            {t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={handleClearAll}>
                      Clear All
                    </Button>
                    <Button onClick={fetchData}>Apply</Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Product grid */}
        <div className="md:col-span-4 space-y-4 p-2 md:p-0">
          <div>
            <div className="font-bold text-xl">Results</div>
            <div>Check each product page for other buying options</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {products.length === 0 && <div>No product found</div>}
            {products.map((product) => (
              <ProductCard key={product._id.toString()} product={product} />
            ))}
          </div>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
        </div>
      </div>
    </div>
  );
}
