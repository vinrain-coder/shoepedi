import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}
