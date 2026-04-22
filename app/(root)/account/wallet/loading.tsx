import { AccountPageSkeleton, TableSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <TableSkeleton rows={8} cols={4} />
    </AccountPageSkeleton>
  );
}
