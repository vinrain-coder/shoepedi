import { getSetting } from "@/lib/actions/setting.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { connectToDatabase, enableProductsCache, Product, resolveSortOrder } from "./shared";
import { buildAdminBaseFilters, LOW_STOCK_THRESHOLD } from "./admin-filters";

export async function getAllProductsForAdmin(params: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
  category?: string;
  brand?: string;
  tag?: string;
  gender?: string;
  isPublished?: string;
  from?: string;
  to?: string;
}) {
  enableProductsCache();
  await connectToDatabase();

  const { common: { pageSize } } = await getSetting();
  const page = params.page ?? 1;
  const limit = params.limit || pageSize;

  const publishedFilter =
    params.isPublished === "true"
      ? { isPublished: true }
      : params.isPublished === "false"
        ? { isPublished: false }
        : params.isPublished === "out_of_stock"
          ? { countInStock: { $lte: 0 } }
          : params.isPublished === "low_stock"
            ? { countInStock: { $lte: LOW_STOCK_THRESHOLD, $gt: 0 } }
            : {};

  const filters = { ...buildAdminBaseFilters(params), ...publishedFilter };

  const [products, countProducts] = await Promise.all([
    Product.find(filters)
      .sort(resolveSortOrder(params.sort))
      .skip(limit * (Number(page) - 1))
      .limit(limit)
      .lean(),
    Product.countDocuments(filters),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + products.length,
  };
}
