import { MetadataRoute } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/db/models/product.model";
import Blog from "@/lib/db/models/blog.model";
import Category from "@/lib/db/models/category.model";
import Brand from "@/lib/db/models/brand.model";
import Tag from "@/lib/db/models/tag.model";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site } = await getSetting();
  await connectToDatabase();

  // Static routes
  const staticRoutes = [
    "",
    "/search",
    "/blogs",
    "/categories",
    "/brands",
    "/tags",
  ].map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic Product routes
  const products = await Product.find({ isPublished: true }, "slug updatedAt");
  const productRoutes = products.map((product) => ({
    url: `${site.url}/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic Blog routes
  const blogs = await Blog.find({ isPublished: true }, "slug updatedAt");
  const blogRoutes = blogs.map((blog) => ({
    url: `${site.url}/blogs/${blog.slug}`,
    lastModified: blog.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Categories, Brands, Tags from their respective models
  const [categories, brands, tags] = await Promise.all([
    Category.find({}, "slug updatedAt"),
    Brand.find({}, "slug updatedAt"),
    Tag.find({}, "slug updatedAt"),
  ]);

  const categoryRoutes = categories.map((c) => ({
    url: `${site.url}/categories/${c.slug}`,
    lastModified: c.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const brandRoutes = brands.map((b) => ({
    url: `${site.url}/brands/${b.slug}`,
    lastModified: b.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const tagRoutes = tags.map((t) => ({
    url: `${site.url}/tags/${t.slug}`,
    lastModified: t.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...categoryRoutes,
    ...brandRoutes,
    ...tagRoutes,
  ];
}
