import Link from "next/link";
import ProductCard from "@/components/shared/product/product-card";
import Pagination from "@/components/shared/pagination";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import {
  getAllProducts,
  getAllCategories,
  getAllTags,
} from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import FiltersClient from "./filters-client";

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

export default async function SearchPage(props: {
  searchParams: Promise<any>;
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

  const [categories, tags, data] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllProducts({
      category,
      tag,
      query: q,
      price,
      rating,
      sort,
      page: Number(page),
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row items-start md:items-center py-3 gap-3">
        <div>
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
          results
        </div>
        <ProductSortSelector
          sortOrders={sortOrders}
          sort={sort}
          params={params}
        />
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        <FiltersClient
          initialParams={params}
          categories={categories}
          tags={tags}
        />
        <div className="md:col-span-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {data.products.length === 0 ? (
              <div>No product found</div>
            ) : (
              data.products.map((p: IProduct) => (
                <ProductCard key={p._id.toString()} product={p} />
              ))
            )}
          </div>
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
