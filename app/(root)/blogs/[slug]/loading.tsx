import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-4">
     <Skeleton className="h-4 w-3/4" />
      {/* Title */}
      <Skeleton className="h-10 w-3/4" />

      {/* Author · Date · Views */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Image */}
     <div className="w-full aspect-[900/500]">
      <Skeleton className="w-full h-full rounded-xl" />
     </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
      </div>
    </div>
  );
}
