import { getSetting } from "@/lib/actions/setting.actions";
import { IProduct } from "@/lib/db/models/product.model";
import {
  buildArrayRegexFilter,
  buildCaseInsensitiveRegexFilter,
  connectToDatabase,
  enableProductsCache,
  Product,
  resolveSortOrder,
} from "./shared";

export async function getRelatedProductsByCategory({ category, productId, limit = 4, page = 1 }: { category: string; productId: string; limit?: number; page: number; }) {
  enableProductsCache();
  const { common: { pageSize } } = await getSetting();
  const pageLimit = limit || pageSize;

  await connectToDatabase();
  const skipAmount = (Number(page) - 1) * pageLimit;
  const conditions = { isPublished: true, category, _id: { $ne: productId } };

  const [products, productsCount] = await Promise.all([
    Product.find(conditions).sort({ numSales: "desc" }).skip(skipAmount).limit(pageLimit),
    Product.countDocuments(conditions),
  ]);

  return { data: JSON.parse(JSON.stringify(products)) as IProduct[], totalPages: Math.ceil(productsCount / pageLimit) };
}

export async function getAllProducts({ query, limit, page, category, tag, brand, gender, color, size, price, rating, sort }: { query: string; category: string; tag: string; brand: string; gender: string; color: string; size: string; limit?: number; page: number; price?: string; rating?: string; sort?: string; }) {
  enableProductsCache();
  const { common: { pageSize } } = await getSetting();
  const pageLimit = limit ?? pageSize;
  const skip = pageLimit * (page - 1);

  await connectToDatabase();

  const filters = {
    isPublished: true,
    ...buildCaseInsensitiveRegexFilter("name", query, false),
    ...buildCaseInsensitiveRegexFilter("category", category),
    ...buildArrayRegexFilter("tags", tag),
    ...buildCaseInsensitiveRegexFilter("brand", brand),
    ...buildCaseInsensitiveRegexFilter("gender", gender),
    ...buildArrayRegexFilter("colors", color),
    ...buildArrayRegexFilter("sizes", size),
    ...(price && price !== "all" ? { price: { $gte: Number(price.split("-")[0]), $lte: Number(price.split("-")[1]) } } : {}),
    ...(rating && rating !== "all" ? { avgRating: { $gte: Number(rating) } } : {}),
  };

  const [products, totalProducts] = await Promise.all([
    Product.find(filters).sort(resolveSortOrder(sort)).skip(skip).limit(pageLimit).lean(),
    Product.countDocuments(filters),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalProducts,
    totalPages: Math.ceil(totalProducts / pageLimit),
    from: skip + 1,
    to: skip + products.length,
  };
}
