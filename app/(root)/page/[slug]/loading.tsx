import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
   <div className="p-1 sm:p-2 md:p-8 max-w-3xl mx-auto">
      {/* Title */}
      <Skeleton className="h-10 w-3/4 pb-4" />

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
