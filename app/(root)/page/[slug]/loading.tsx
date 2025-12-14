import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-1 sm:p-2 md:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
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
      
