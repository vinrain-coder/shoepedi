import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";

import Product from "@/lib/db/models/product.model";
import { connectToDatabase } from "@/lib/db";

/* ---------------------------------------------
   Stable cached DB call
   ---------------------------------------------- */

const getBrowsingProducts = cache(
  async (idsKey: string, categoriesKey: string) => {
    await connectToDatabase();

    const productIds = idsKey.split(",");
    const categories = categoriesKey.split(",");

    const [history, related] = await Promise.all([
      // Browsing history (ordered)
      Product.find({ _id: { $in: productIds } }),

      // Related products (bounded & fast)
      Product.find({
        category: { $in: categories },
        _id: { $nin: productIds },
      })
        .limit(20)
        .lean(),
    ]);

    return { history, related };
  }
);

export const GET = async (request: NextRequest) => {
  const type = request.nextUrl.searchParams.get("type") || "both";
  const ids = request.nextUrl.searchParams.get("ids");
  const categories = request.nextUrl.searchParams.get("categories");

  if (!ids || !categories) {
    return NextResponse.json({ history: [], related: [] });
  }

  // 1️⃣ SINGLE CACHED CALL
  const { history, related } = await getBrowsingProducts(ids, categories);

  // 2️⃣ Preserve browsing order
  const orderedHistory = history.sort(
    (a, b) => ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString())
  );

  if (type === "history") {
    return NextResponse.json(orderedHistory);
  }

  if (type === "related") {
    return NextResponse.json(related);
  }

  // 3️⃣ Default: both
  return NextResponse.json({
    history: orderedHistory,
    related,
  });
};
