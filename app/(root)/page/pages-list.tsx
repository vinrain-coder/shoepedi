// app/webpages/webpages-list.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { IWebPage } from "@/lib/db/models/web-page.model";
import { getAllWebPages } from "@/lib/actions/web-page.actions";
import { cacheLife } from "next/cache";


export default async function WebPagesList() {
    "use cache"
    cacheLife("days")
  const pages = await getAllWebPages();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {pages.map((page: IWebPage) => (
        <Card key={page._id} className="hover:shadow-lg transition">
          <CardContent className="p-2 space-y-2">
            <h2 className="font-bold text-lg">{page.title}</h2>
            {/* {page.content && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {page.content}
              </p>
            )} */}
            <Link
              className="text-primary underline text-sm"
              href={`/page/${page.slug}`}
            >
              View Page
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
