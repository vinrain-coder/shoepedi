import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getAllTagsForStore } from "@/lib/actions/tag.actions";
import type { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";

/* ------------------------- Metadata ------------------------- */
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSetting();

  return {
    title: `Shop by Tag | ${site.name}`,
    description:
      "Browse all product tags available in our store. Find products faster using tags.",
    alternates: {
      canonical: `${site.url}/tags`,
    },
    openGraph: {
      title: `Shop by Tag | ${site.name}`,
      description:
        "Explore products using tags and discover items that match your interests.",
      url: `${site.url}/tags`,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop by Tag | ${site.name}`,
      description:
        "Browse products by tags and discover items that match your needs.",
    },
  };
}

/* ------------------------- Page ------------------------- */
export default async function TagsPage() {
  const tags = await getAllTagsForStore();
  const { site } = await getSetting();

  const tagSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Tags",
    itemListElement: tags.map((tag: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/tags/${tag.slug}`,
      name: tag.name,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tagSchema) }}
      />

      <Breadcrumb />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Tags</h1>
        <p className="text-muted-foreground">
          Discover products using tags
        </p>
        <p className="sr-only">
          Browse our full list of product tags and quickly find products you
          are interested in.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tags.map((tag: any) => (
          <Link
            key={tag._id}
            href={`/tags/${tag.slug}`}
            aria-label={`Browse ${tag.name} products`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-secondary/20 h-full p-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                {tag.image ? (
                  <Image
                    src={tag.image}
                    alt={`${tag.name} tag image`}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {tag.name} Products
                </h3>

                {tag.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {tag.description}
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
