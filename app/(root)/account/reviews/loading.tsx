import { AccountPageSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <TableSkeleton />
    </AccountPageSkeleton>
  );
}
