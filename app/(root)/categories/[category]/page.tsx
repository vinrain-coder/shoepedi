import ProductCard from "@/components/shared/product/product-card";
import Pagination from "@/components/shared/pagination";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import {
  getAllProducts,
  getAllCategories,
  getAllTags,
  getAllBrands,
  getAllColors,
  getAllSizes,
} from "@/lib/actions/product.actions";
import FiltersClient from "@/components/shared/search/filters-client";
import { IProduct } from "@/lib/db/models/product.model";

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: Promise<any>;
}) {
  const sp = await searchParams;

  const {
    q = "all",
    tag = "all",
    brand = "all",
    color = "all",
    size = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = sp;

  const category = params.category;

  const filterParams = {
    q,
    category,
    tag,
    brand,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  const [categories, tags, brands, colors, sizes, data] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        query: q,
        category,
        tag,
        brand,
        color,
        size,
        price,
        rating,
        sort,
        page: Number(page),
      }),
    ]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row items-start md:items-center py-3 gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">
            {category.replace(/-/g, " ")}
          </h1>
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
          products
        </div>

        <ProductSortSelector
          sortOrders={sortOrders}
          sort={sort}
          params={filterParams}
        />
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        <FiltersClient
          initialParams={filterParams}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath={`/category/${category}`}
          lockCategory
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
  
