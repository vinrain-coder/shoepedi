import { connectToDatabase, enableProductsCache, Product, toTitleCase } from "./shared";

export async function getAllTags() {
  enableProductsCache();
  await connectToDatabase();

  const tags = await Product.aggregate([
    { $match: { tags: { $exists: true, $ne: [] } } },
    { $unwind: "$tags" },
    { $set: { tags: { $trim: { input: { $toLower: "$tags" } } } } },
    { $group: { _id: "$tags" } },
    { $sort: { _id: 1 } },
    { $project: { tag: "$_id", _id: 0 } },
  ]);

  return tags.map(({ tag }) =>
    tag
      .split(" ")
      .map((word: string) =>
        word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-"),
      )
      .join(" ")
      .trim(),
  );
}

export async function getAllTagsForAdminProductCreate() {
  enableProductsCache();
  await connectToDatabase();

  const tags = await Product.aggregate([
    { $match: { tags: { $exists: true, $ne: [] } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags" } },
    { $sort: { _id: 1 } },
    { $project: { tag: "$_id", _id: 0 } },
  ]);

  return tags.map((t) => t.tag);
}

export async function getAllBrands(): Promise<string[]> {
  enableProductsCache();
  await connectToDatabase();
  const brands = await Product.aggregate([
    { $match: { brand: { $exists: true, $ne: "" } } },
    { $project: { brand: { $trim: { input: { $toLower: "$brand" } } } } },
    { $group: { _id: "$brand" } },
    { $sort: { _id: 1 } },
    { $project: { brand: "$_id", _id: 0 } },
  ]);

  return brands.map((b) => toTitleCase(b.brand));
}

export async function getAllColors(): Promise<string[]> {
  enableProductsCache();
  await connectToDatabase();
  const colors = await Product.aggregate([
    { $match: { colors: { $exists: true, $ne: [] } } },
    { $unwind: "$colors" },
    { $set: { colors: { $trim: { input: { $toLower: "$colors" } } } } },
    { $group: { _id: "$colors" } },
    { $sort: { _id: 1 } },
    { $project: { color: "$_id", _id: 0 } },
  ]);

  return colors.map((c) => toTitleCase(c.color));
}

export async function getAllSizes(): Promise<string[]> {
  enableProductsCache();
  await connectToDatabase();
  const sizes = await Product.aggregate([
    { $match: { sizes: { $exists: true, $ne: [] } } },
    { $unwind: "$sizes" },
    { $set: { sizes: { $trim: { input: { $toLower: "$sizes" } } } } },
    { $group: { _id: "$sizes" } },
    { $sort: { _id: 1 } },
    { $project: { size: "$_id", _id: 0 } },
  ]);

  return sizes.map((s) => toTitleCase(s.size));
}
