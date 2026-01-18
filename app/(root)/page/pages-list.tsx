import { Card, CardContent } from "@/components/ui/card";
import { IWebPage } from "@/lib/db/models/web-page.model";
import { getAllWebPages } from "@/lib/actions/web-page.actions";
import { cacheLife } from "next/cache";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function WebPagesList() {
  "use cache";
  cacheLife("days");

  const pages = await getAllWebPages();

  if (!pages || pages.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No pages found.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page: IWebPage) => (
        <Link key={page.id} href={`/page/${page.slug}`} className="group">
          <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-secondary/20 p-0">
            {/* 1. Image Thumbnail Section */}
            {/* <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={page.image || "/placeholder-shoe.jpg"} 
                alt={page.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div> */}

            <CardContent className="p-5 flex flex-col h-[calc(100%-auto)]">
              {/* 2. Content Info */}
              <h2 className="font-bold text-xl mb-2 text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                {page.title}
              </h2>

              {page.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                  {page.excerpt}
                </p>
              )}

              {/* 3. Modern Call to Action */}
              <div className="flex items-center text-sm font-semibold text-primary uppercase tracking-wider">
                Explore
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
