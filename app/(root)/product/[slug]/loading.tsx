import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Top Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT — Gallery */}
          <div className="col-span-2 space-y-4">
            <Skeleton className="w-full h-[350px] rounded-xl" />
            <Skeleton className="w-1/2 h-6 rounded-md" />
          </div>

          {/* CENTER — Product Info */}
          <div className="col-span-2 flex flex-col gap-5 md:p-5">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" /> {/* brand */}
              <Skeleton className="h-8 w-3/4" /> {/* title */}
              <Skeleton className="h-6 w-32" /> {/* rating */}
              <Skeleton className="h-8 w-24" /> {/* price */}
            </div>

            {/* Variant selectors */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* RIGHT — Purchase Card */}
          <div>
            <div className="p-4 border rounded-lg space-y-4 shadow-sm">
              <Skeleton className="h-8 w-1/3" /> {/* price */}
              <Skeleton className="h-6 w-40" /> {/* stock status */}
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Add to cart */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* WhatsApp */}
              <Skeleton className="h-8 w-full rounded-md" /> {/* Wishlist */}
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <div className="mt-10 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Reviews Section */}
      <section className="mt-10">
        <Skeleton className="h-7 w-52 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-10">
        <Skeleton className="h-6 w-56 mb-4" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-32 rounded-md" />
          <Skeleton className="h-32 rounded-md" />
          <Skeleton className="h-32 rounded-md" />
          <Skeleton className="h-32 rounded-md" />
        </div>
      </section>
    </div>
  );
}
