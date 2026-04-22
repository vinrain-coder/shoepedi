import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-8 w-64" />
    </div>
  );
}
