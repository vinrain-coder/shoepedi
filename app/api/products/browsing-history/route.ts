import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/db/models/product.model";
import { connectToDatabase } from "@/lib/db";

async function getBrowsingProducts(idsKey: string, categoriesKey: string) {
  await connectToDatabase();

  const productIds = idsKey.split(",");
  const categories = categoriesKey.split(",");

  const [history, related] = await Promise.all([
    // Browsing history
    Product.find({ _id: { $in: productIds } }).lean(),

    // Related products (stronger logic)
    Product.find({
      $or: [
        { category: { $in: categories } },
        { isFeatured: true }, // fallback if category is weak
      ],
      _id: { $nin: productIds },
    })
      .limit(20)
      .lean(),
  ]);

  return { history, related, productIds };
}

export const GET = async (request: NextRequest) => {
  const type = request.nextUrl.searchParams.get("type") || "both";
  const ids = request.nextUrl.searchParams.get("ids");
  const categories = request.nextUrl.searchParams.get("categories");

  if (!ids || !categories) {
    return NextResponse.json({ history: [], related: [] });
  }

  const { history, related, productIds } = await getBrowsingProducts(
    ids,
    categories
  );

  // ✅ Preserve browsing order correctly
  const orderedHistory = history.sort(
    (a: any, b: any) =>
      productIds.indexOf(a._id.toString()) -
      productIds.indexOf(b._id.toString())
  );

  if (type === "history") return NextResponse.json(orderedHistory);
  if (type === "related") return NextResponse.json(related);

  return NextResponse.json({
    history: orderedHistory,
    related
         ,
  });
};
