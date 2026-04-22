import { CardGridSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-wrap gap-2">
         {Array.from({ length: 20 }).map((_, i) => (
           <Skeleton key={i} className="h-8 w-24 rounded-full" />
         ))}
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}
