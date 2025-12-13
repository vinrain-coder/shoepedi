import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-2 py-8 space-y-8">
      {/* Heading */}
      <Skeleton className="h-10 w-64" />

      {/* Paragraph */}
      <div className="space-y-2 max-w-2xl">
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border p-4">
            {/* Image */}
            <Skeleton className="h-40 w-full rounded-lg" />

            {/* Title */}
            <Skeleton className="h-5 w-3/4" />

            {/* Meta */}
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
