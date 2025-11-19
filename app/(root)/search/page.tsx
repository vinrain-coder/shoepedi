import SearchPageClient from "./searchpage-client";
import {
  getAllCategories,
  getAllProducts,
  getAllTags,
} from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";

type SearchParams = {
  q?: string;
  category?: string;
  tag?: string;
  rating?: string;
  sort?: string;
  page?: string;
  price?: string;
};

const defaultPriceRange: [number, number] = [0, 10000];

function parsePrice(price?: string): [number, number] {
  if (!price) return defaultPriceRange;
  const [a, b] = price.split("-").map(Number);
  return [a || 0, b || 10000];
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = params.q || "all";
  const category = params.category || "all";
  const tag = params.tag || "all";
  const rating = params.rating || "all";
  const sort = params.sort || "best-selling";
  const page = params.page || "1";
  const price =
    params.price || `${defaultPriceRange[0]}-${defaultPriceRange[1]}`;

  const parsedParams = { q, category, tag, rating, price, sort, page };

  const [categories, tags, data] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllProducts(parsedParams),
  ]);

  const initialProducts: IProduct[] = data.products || [];
  const initialTotalProducts: number = data.totalProducts || 0;
  const initialTotalPages: number = data.totalPages || 1;
  const initialFromTo = { from: data.from || 0, to: data.to || 0 };

  return (
    <SearchPageClient
      initialCategories={categories}
      initialTags={tags}
      initialProducts={initialProducts}
      initialTotalProducts={initialTotalProducts}
      initialTotalPages={initialTotalPages}
      initialFromTo={initialFromTo}
      initialParams={parsedParams}
    />
  );
}
