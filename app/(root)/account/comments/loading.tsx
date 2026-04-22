import { AccountPageSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <TableSkeleton rows={5} cols={4} />
    </AccountPageSkeleton>
  );
}
