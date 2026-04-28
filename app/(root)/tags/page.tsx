import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getAllTagsForStore } from "@/lib/actions/tag.actions";
import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";

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
  const [tags, { site }] = await Promise.all([
    getAllTagsForStore(),
    getSetting(),
  ]);
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tagSchema) }}
      />

      <Breadcrumb />

      <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-100">
        <Badge
          variant="secondary"
          className="px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold"
        >
          Quick Search
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Browse Tags
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore products curated by specific tags. Narrow down your search and
          find items that match your unique interests.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tags.map((tag: any, index: number) => (
          <Link
            key={tag._id}
            href={`/tags/${tag.slug}`}
            aria-label={`Browse ${tag.name} products`}
            className="group block animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="overflow-hidden rounded-xl border-none shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-card p-0">
              <div className="relative aspect-4/3 w-full overflow-hidden">
                {tag.image ? (
                  <Image
                    src={tag.image}
                    alt={`${tag.name} tag image`}
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
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                    {tag.name}
                  </h3>
                  {tag.description && (
                    <p className="text-xs text-gray-200 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {tag.description}
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
