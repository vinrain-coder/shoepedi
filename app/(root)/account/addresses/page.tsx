import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";
import Breadcrumb from "@/components/shared/breadcrumb";
import { normalizeAddressBookEntries } from "@/lib/address-book";
import AddressBook from "./address-book";

async function page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect(toSignInPath(`/account/addresses${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`));
  }

  return (
    <>
      <Breadcrumb />
      <div className="space-y-4">
        <h1 className="h1-bold">Your addresses</h1>
        <p className="text-muted-foreground text-sm">
          Save multiple addresses, set a default, and reuse them at checkout.
        </p>
        <AddressBook initialAddresses={normalizeAddressBookEntries(session.user.addresses)} returnTo={returnTo} />
      </div>
    </>
  );
}

export default page;
