"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ClassicSkeletonCard() {
  return (
    <Card className="flex flex-col rounded-sm p-0 overflow-hidden">
      <Skeleton className="h-52 sm:h-56 w-full" />
      <CardContent className="space-y-3 pt-3">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-24 mx-auto" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}

function DetailedSkeletonCard() {
  return (
    <Card className="overflow-hidden rounded-md border p-3">
      <div className="grid grid-cols-[104px_1fr] sm:grid-cols-[144px_1fr] gap-3">
        <Skeleton className="aspect-square w-full rounded-lg" />

        <div className="space-y-3">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          <div className="flex gap-2">
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>

          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </Card>
  );
}

export default function ProductLoadingOverlay({
  layout = "classic",
}: {
  layout?: "classic" | "detailed";
}) {
  const count = layout === "detailed" ? 4 : 8;

  return (
    <div className="w-full">
      {/* ONLY product grid area */}
      <div
        className={
          layout === "classic"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "space-y-4 max-w-6xl mx-auto"
        }
      >
        {Array.from({ length: count }).map((_, i) =>
          layout === "classic" ? (
            <ClassicSkeletonCard key={i} />
          ) : (
            <DetailedSkeletonCard key={i} />
          ),
        )}
      </div>
    </div>
  );
}
