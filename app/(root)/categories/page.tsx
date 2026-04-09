import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getAllCategoriesForStore } from "@/lib/actions/category.actions";
import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSetting();

  return {
    title: `Shop by Category | ${site.name}`,
    description:
      "Browse all product categories available in our store. Find exactly what you're looking for.",
    alternates: {
      canonical: `${site.url}/categories`,
    },
    openGraph: {
      title: `Shop by Category | ${site.name}`,
      description:
        "Explore our diverse range of product categories and find your favorites.",
      url: `${site.url}/categories`,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop by Category | ${site.name}`,
      description:
        "Browse our product categories and discover amazing products.",
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />

      <Breadcrumb />

      <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-100">
        <Badge variant="secondary" className="px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold">
          Our Collections
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Browse Categories
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of collections curated just for you. From daily essentials to premium selections.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {categories.map((category: any, index: number) => (
          <Link
            key={category._id}
            href={`/categories/${category.slug}`}
            aria-label={`Browse ${category.name} products`}
            className="group block animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="overflow-hidden rounded-2xl border-none shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-card">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={`${category.name} product category image`}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground">
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}

                {/* Refined Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-200 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
