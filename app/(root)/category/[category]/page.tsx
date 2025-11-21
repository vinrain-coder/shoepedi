import { Metadata } from "next";
import ProductCard from "@/components/shared/product/product-card";
import Pagination from "@/components/shared/pagination";
import ProductSortSelector from "@/components/shared/product/product-sort-selector"
import {
  getAllProducts,
  getAllCategories,
  getAllTags,
} from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

type Props = {
  params: { category: string };
  searchParams?: {
    page?: string;
    sort?: string;
    price?: string;
    rating?: string;
    tag?: string;
    q?: string;
  };
};

// SEO metadata
export function generateMetadata({ params }: Props): Metadata {
  const category = params.category;
  const titleCase = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `Buy ${titleCase} Online | Shoepedi`,
    description: `Shop ${category} online at Shoepedi. Discover the best deals on ${category}.`,
    alternates: {
      canonical: `https://shoepedi.vercel.app/category/${category}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = params;
  const page = Number(searchParams?.page ?? "1");
  const sort = searchParams?.sort ?? "best-selling";
  const price = searchParams?.price ?? "all";
  const rating = searchParams?.rating ?? "all";
  const tag = searchParams?.tag ?? "all";
  const q = searchParams?.q ?? "all";

  // Fetch products, categories, and tags
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
      page,
    }),
  ]);

  const paramsObj = {
    q,
    category,
    tag,
    price,
    rating,
    sort,
    page: page.toString(),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
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
          params={paramsObj}
        />
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        {/* Filters */}
        <FiltersClient
          initialParams={paramsObj}
          categories={categories}
          tags={tags}
        />

        {/* Products */}
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
