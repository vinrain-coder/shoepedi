import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategoriesForStore } from "@/lib/actions/category.actions";

export const metadata = {
  title: "All Categories",
  description: "Browse our wide selection of products by category.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategoriesForStore();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Categories</h1>
        <p className="text-muted-foreground">
          Explore our collection across different categories
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category: any) => (
          <Link
            key={category._id}
            // Syncing with your search page URL pattern
            href={`/categories/${category.slug}`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-secondary/20 h-full">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
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
                  {category.name}
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
