import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-1 sm:p-2 md:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48 mb-4" />

      {/* Title */}
      <Skeleton className="h-9 w-3/4 pb-4" />

      {/* Content */}
      <section>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />

          <div className="h-3" />

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-9/12" />
          <Skeleton className="h-4 w-11/12" />

          <div className="h-3" />

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      </section>
    </div>
  );
}
