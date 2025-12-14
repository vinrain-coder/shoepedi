"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="w-full px-1 py-10">
      {/* Top row loader */}
      <div className="flex items-center gap-2 mb-6">
        <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
        <p className="text-sm text-gray-600">Searching products...</p>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl shadow-sm p-3 flex flex-col gap-3">
            {/* Image placeholder */}
            <Skeleton className="w-full aspect-square rounded-lg" />

            {/* Text placeholders */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
