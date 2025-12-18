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
import Breadcrumb from "@/components/shared/breadcrumb";
import type { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import { getCategoryBySlug } from "@/lib/actions/category.actions";
import { notFound } from "next/navigation"; // Added for proper redirection

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<any>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const sp = await searchParams;
  
  const category = await getCategoryBySlug(categorySlug);
  const { site } = await getSetting();

  // If the category doesn't exist, we don't call notFound here 
  // to avoid interfering with the page's own logic.
  if (!category) {
    return { title: "Category Not Found" };
  }

  const titleBase = category.name;
  const hasFilters = Object.keys(sp || {}).some(
    (k) => sp[k] && sp[k] !== "all"
  );

  return {
    title: hasFilters
      ? `${titleBase} | Filtered Results`
      : `${titleBase} | ${site.name}`,
    description: category.description || `Shop ${titleBase} products.`,
    alternates: { canonical: `${site.url}/categories/${categorySlug}` },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  };
}

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
  params: Promise<{ category: string }>;
  searchParams: Promise<any>;
}) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;

  // 1. Check if category exists first
  const categoryData = await getCategoryBySlug(categorySlug);
  
  // 2. If it doesn't exist, immediately trigger the Not Found page
  if (!categoryData) {
    notFound();
  }

  const { site } = await getSetting();
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

  const filterParams = { q, category: categorySlug, tag, brand, color, size, price, rating, sort, page };

  // 3. Fetch data
  const [categories, tags, brands, colors, sizes, data] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllBrands(),
    getAllColors(),
    getAllSizes(),
    getAllProducts({
      query: q,
      category: categorySlug,
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

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryData.name,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.totalProducts,
      itemListElement: data.products.map((p: IProduct, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="space-y-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }} />
      <Breadcrumb />
      
      <div className="my-2 bg-card md:border-b flex justify-between flex-col md:flex-row items-start md:items-center py-3 gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">{categoryData.name}</h1>
          <p className="text-sm text-muted-foreground">
            {data.totalProducts === 0 ? "No results" : `${data.from}-${data.to} of ${data.totalProducts}`} products
          </p>
        </div>
        <ProductSortSelector sortOrders={sortOrders} sort={sort} params={filterParams} />
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        <FiltersClient
          initialParams={filterParams}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath={`/categories/${categorySlug}`}
          lockCategory
        />
        <div className="md:col-span-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {data.products.length === 0 ? (
              <div className="col-span-full text-center py-10">No products found.</div>
            ) : (
              data.products.map((p: IProduct) => <ProductCard key={p._id.toString()} product={p} />)
            )}
          </div>
          {data.totalPages > 1 && <Pagination page={page} totalPages={data.totalPages} />}
        </div>
      </div>
    </div>
  );
    }
