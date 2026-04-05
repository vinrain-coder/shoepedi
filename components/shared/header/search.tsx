"use client";

import { SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function Search({
  categories,
  siteName,
}: {
  categories: string[];
  siteName: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      setActiveIndex(-1);
      try {
        const res = await getAllProducts({
          query,
          category,
          limit: 6,
          page: 1,
          tag: "all",
          brand: "all",
          color: "all",
          size: "all",
        });
        setSuggestions(res.products);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, category]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSuggestionClick(suggestions[activeIndex].slug);
    } else if (query.trim()) {
      router.push(`/search?q=${query}&category=${category}`);
    } else {
      router.push(`/search?category=${category}`);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setIsOpen(false);
    router.push(`/product/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch h-9"
        role="search"
      >
        <Select
          name="category"
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setActiveIndex(-1);
          }}
        >
          <SelectTrigger className="w-auto h-full dark:border-gray-200 bg-gray-100 border-r rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none cursor-pointer focus:ring-0">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="flex-1 rounded-none dark:border-gray-200 bg-gray-100 text-black dark:text-white text-base h-full focus-visible:ring-0"
          placeholder={`Search ${siteName}`}
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        <button
          type="submit"
          className="bg-primary text-black rounded-s-none rounded-e-md h-9 px-3 py-2 cursor-pointer"
          aria-label="Search"
        >
          <SearchIcon className="w-6 h-6" />
        </button>
      </form>

      {isOpen && (
        <div
          id="search-results"
          className="absolute z-50 w-full bg-card border shadow-lg rounded-md mt-1 max-h-[400px] overflow-y-auto"
          role="listbox"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((product, index) => (
                <li
                  key={product._id.toString()}
                  onClick={() => handleSuggestionClick(product.slug)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-3 transition-colors ${
                    index === activeIndex ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
