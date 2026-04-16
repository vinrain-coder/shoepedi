import { connectToDatabase, enableProductsCache, Product, toTitleCase } from "./shared";
import { buildAdminBaseFilters, LOW_STOCK_THRESHOLD } from "./admin-filters";

export async function getProductAdminStats(params: {
  query?: string;
  category?: string;
  brand?: string;
  tag?: string;
  gender?: string;
  from?: string;
  to?: string;
}) {
  enableProductsCache();
  await connectToDatabase();

  const baseFilters = buildAdminBaseFilters(params);

  const [totalProducts, publishedProducts, draftProducts, outOfStockProducts, lowStockProducts] =
    await Promise.all([
      Product.countDocuments(baseFilters),
      Product.countDocuments({ ...baseFilters, isPublished: true }),
      Product.countDocuments({ ...baseFilters, isPublished: false }),
      Product.countDocuments({ ...baseFilters, countInStock: { $lte: 0 } }),
      Product.countDocuments({
        ...baseFilters,
        countInStock: { $lte: LOW_STOCK_THRESHOLD, $gt: 0 },
      }),
    ]);

  return { totalProducts, publishedProducts, draftProducts, outOfStockProducts, lowStockProducts };
}

export async function getProductsForCard({ tag, limit = 4 }: { tag: string; limit?: number }) {
  enableProductsCache();
  await connectToDatabase();
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    { name: 1, href: { $concat: ["/product/", "$slug"] }, image: { $arrayElemAt: ["$images", 0] } },
  )
    .sort({ createdAt: "desc" })
    .limit(limit);

  return JSON.parse(JSON.stringify(products)) as { name: string; href: string; image: string }[];
}

export async function getAllCategories(): Promise<string[]> {
  enableProductsCache();
  await connectToDatabase();
  const categories = await Product.aggregate([
    { $match: { isPublished: true, category: { $exists: true, $ne: "" } } },
    { $project: { category: { $trim: { input: { $toLower: "$category" } } } } },
    { $group: { _id: "$category" } },
    { $sort: { _id: 1 } },
    { $project: { category: "$_id", _id: 0 } },
  ]);

  return categories.map((c) => toTitleCase(c.category));
}
