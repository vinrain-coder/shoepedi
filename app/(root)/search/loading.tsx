import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col rounded-sm p-0">
      <Skeleton className="h-52 sm:h-56 w-full rounded-t-sm" />

      <CardContent className="space-y-3 pt-3">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-24 mx-auto" />
      </CardContent>

      <CardFooter>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}

function SidebarSkeleton() {
  return (
    <div className="hidden md:block md:col-span-1">
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-auto p-4 border rounded-lg bg-card space-y-6">
        <Skeleton className="h-6 w-24" />

        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-2 md:space-y-4">
      {/* Top toolbar */}
      <div className="my-1 rounded-xl bg-card p-2.5 md:my-2 md:border-b md:rounded-none md:px-0 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-3">
        <Skeleton className="h-4 w-40" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-2 md:py-3">
        <SidebarSkeleton />

        {/* Products */}
        <div className="md:col-span-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
