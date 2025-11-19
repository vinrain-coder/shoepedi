import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Rating from "@/components/shared/product/rating";
import { toSlug } from "@/lib/utils";

export default function FiltersDesktop({
  categories,
  tags,
  category,
  tag,
  rating,
  priceRange,
  minPriceInput,
  maxPriceInput,
  setMinPriceInput,
  setMaxPriceInput,
  setPriceRange,
  handleFilterChange,
  handlePriceApply,
  defaultPriceRange,
}: {
  categories: string[];
  tags: string[];
  category: string;
  tag: string;
  rating: string;
  priceRange: [number, number];
  minPriceInput: number;
  maxPriceInput: number;
  setMinPriceInput: (n: number) => void;
  setMaxPriceInput: (n: number) => void;
  setPriceRange: (r: [number, number]) => void;
  handleFilterChange: (filter: string, value: any) => void;
  handlePriceApply: () => void;
  defaultPriceRange: [number, number];
}) {
  return (
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
            const arr = v as number[];
            setMinPriceInput(arr[0]);
            setMaxPriceInput(arr[1]);
            setPriceRange([arr[0], arr[1]]);
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
                <Rating size={4} rating={4} /> &nbsp; & Up
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
  );
}
