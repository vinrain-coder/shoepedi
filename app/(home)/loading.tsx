import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      {/* Carousel Placeholder */}
      <Skeleton className="w-full h-[120px] md:h-[450px] rounded-md" />

      {/* Category Cards Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 md:h-40 w-full rounded-md" />
        ))}
      </div>

      {/* Today's Deals and Best Sellers */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="p-4 bg-border rounded-md">
            <Skeleton className="h-6 w-1/4 mb-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 md:h-52 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Browsing History & About Section */}
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-40 w-full rounded-md" />

      {/* Blog Section */}
      <div className="p-4 bg-background">
        <Skeleton className="h-6 w-1/4 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 md:h-52 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
