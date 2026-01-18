import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategoriesForStore } from "@/lib/actions/category.actions";
import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSetting();
  return {
    title: `Shop by Category | ${site.name}`,
    description:
      "Browse all product categories in our store. Find electronics, fashion, home essentials, and more.",
    alternates: {
      canonical: `${site.url}/categories`,
    },
    openGraph: {
      title: `Shop by Category | ${site.name}`,
      description:
        "Browse all product categories in our store. Discover products faster by category.",
      url: `${site.url}/categories`,
      siteName: `${site.name}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop by Category | ${site.name}`,
      description:
        "Explore our store by category and find what you need faster.",
    },
  };
}

export default async function CategoriesPage() {
  const categories = await getAllCategoriesForStore();
  const { site } = await getSetting();

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Categories",
    itemListElement: categories.map((category: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/categories/${category.slug}`,
      name: category.name,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      <Breadcrumb />
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Categories</h1>
        <p className="text-muted-foreground">
          Explore our collection across different categories
        </p>
        <p className="sr-only">
          Browse our full list of product categories including electronics,
          fashion, home appliances, beauty products, and more. Shop by category
          to find exactly what you need.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category: any) => (
          <Link
            key={category._id}
            // Syncing with your search page URL pattern
            href={`/categories/${category.slug}`}
            aria-label={`Browse ${category.name} products`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-secondary/20 h-full p-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={`${category.name} product category image`}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  // Fallback if no image is uploaded
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm">No Image</span>
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {category.name} Products
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {category.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
