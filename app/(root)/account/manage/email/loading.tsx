import { AccountPageSkeleton, FormSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <AccountPageSkeleton>
      <FormSkeleton />
    </AccountPageSkeleton>
  );
}
