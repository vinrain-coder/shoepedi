import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";
import Breadcrumb from "@/components/shared/breadcrumb";
import { getUserAddresses } from "@/lib/actions/address.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AddressBook from "./address-book";

async function page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const result = await getUserAddresses();

  if (!result.success || !result.data) {
    if (result.message?.toLowerCase().includes("signed in")) {
      redirect(toSignInPath(`/account/addresses${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`));
    }
    return (
      <>
        <Breadcrumb />
        <div className="space-y-4">
          <h1 className="h1-bold">Your addresses</h1>
          <p className="text-sm text-red-600">
            {result.message || "Unable to load your addresses."}
          </p>
          <Link href="/account">
            <Button variant="outline">Back to account</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb />
      <div className="space-y-4">
        <h1 className="h1-bold">Your addresses</h1>
        <p className="text-muted-foreground text-sm">
          Save multiple addresses, set a default, and reuse them at checkout.
        </p>
        <AddressBook initialAddresses={result.data} returnTo={returnTo} />
      </div>
    </>
  );
}

export default page;
