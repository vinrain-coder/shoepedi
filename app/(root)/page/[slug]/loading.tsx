import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-4 space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* Title */}
      <Skeleton className="h-9 w-3/4" />

     {/* Markdown Content */}
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
    </div>
  );
}
        
