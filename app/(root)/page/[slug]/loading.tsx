import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-2 w-full">
      {/* Breadcrumb skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-10 w-3/4 mb-6" />

      {/* Markdown content skeleton */}
      <section className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <Skeleton className="h-4 w-full mt-6" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />

        {/* Simulate heading */}
        <Skeleton className="h-6 w-1/2 mt-8" />

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </section>
    </div>
  );
}
      
