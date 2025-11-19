import { Button } from "@/components/ui/button";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";

export default function ResultsHeader({
  totalProducts,
  fromTo,
  selectedFilters,
  onClearAll,
  sort,
  setSort,
  buildParams,
  sortOrders,
}: {
  totalProducts: number;
  fromTo: { from: number; to: number };
  selectedFilters: string[];
  onClearAll: () => void;
  sort: string;
  setSort: (s: string) => void;
  buildParams: () => Record<string, any>;
  sortOrders: { value: string; name: string }[];
}) {
  return (
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
                onClick={() => {}}
              >
                {f} ×
              </Button>
            ))}

            <Button variant="link" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2 md:mt-0">
        {/* ProductSortSelector is an existing shared component */}
        <ProductSortSelector
          sortOrders={sortOrders}
          sort={sort}
          params={buildParams()}
        />
      </div>
    </div>
  );
}
