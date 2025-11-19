import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";

import Product from "@/lib/db/models/product.model";
import { connectToDatabase } from "@/lib/db";

const getProductsCached = cache(async (filter: any) => {
  await connectToDatabase();
  return Product.find(filter);
});

export const GET = async (request: NextRequest) => {
  const listType = request.nextUrl.searchParams.get("type") || "history";
  const productIdsParam = request.nextUrl.searchParams.get("ids");
  const categoriesParam = request.nextUrl.searchParams.get("categories");

  if (!productIdsParam || !categoriesParam) {
    return NextResponse.json([]);
  }

  const productIds = productIdsParam.split(",");
  const categories = categoriesParam.split(",");

  const filter =
    listType === "history"
      ? { _id: { $in: productIds } }
      : { category: { $in: categories }, _id: { $nin: productIds } };

  const products = await getProductsCached(filter);

  if (listType === "history") {
    return NextResponse.json(
      products.sort(
        (a, b) =>
          productIds.indexOf(a._id.toString()) -
          productIds.indexOf(b._id.toString())
      )
    );
  }

  return NextResponse.json(products);
};
