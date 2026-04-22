import { AccountPageSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <TableSkeleton rows={4} cols={5} />
    </AccountPageSkeleton>
  );
}
