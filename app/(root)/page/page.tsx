// app/webpages/page.tsx
import { Suspense } from "react";
import WebPagesList from "./pages-list";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Pages",
};

export default function WebPagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Website Pages</h1>

      <Suspense fallback={<WebPagesSkeleton />}>
        <WebPagesList />
      </Suspense>
    </div>
  );
}

// Lightweight skeleton for streaming UI
function WebPagesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
