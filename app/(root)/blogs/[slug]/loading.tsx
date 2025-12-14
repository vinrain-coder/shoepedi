import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-4 space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* Title */}
      <Skeleton className="h-10 w-11/12" />
      <Skeleton className="h-10 w-11/12" />

      {/* Author · Date · Views */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Blog Image (matches markdown image layout) */}
      <div className="w-full aspect-[900/500]">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>

      {/* Markdown Content */}
      <div className="space-y-3">
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

      {/* Blog Meta Info */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Separator */}
      <Skeleton className="h-px w-full" />

      {/* Share Section */}
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-10 w-40 rounded-md" />
    </div>
  );
}
        
