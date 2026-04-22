import { AccountPageSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="flex gap-4 mt-6">
           <Skeleton className="h-10 w-32" />
           <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </AccountPageSkeleton>
  );
}
