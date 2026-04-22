import { AccountPageSkeleton, CardGridSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <CardGridSkeleton count={4} />
    </AccountPageSkeleton>
  );
}
