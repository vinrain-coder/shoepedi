import { AccountPageSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <TableSkeleton rows={10} cols={6} />
    </AccountPageSkeleton>
  );
}
