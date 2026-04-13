import { Metadata } from "next";
import CheckoutForm from "./checkout-form";
import { getServerSession } from "@/lib/get-session";
import { normalizeAddressBookEntries } from "@/lib/address-book";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ selectedAddressId?: string }>;
}) {
  const session = await getServerSession();
  const { selectedAddressId } = await searchParams;

  return (
    <CheckoutForm
      savedAddresses={normalizeAddressBookEntries(session?.user?.addresses)}
      selectedAddressId={selectedAddressId}
    />
  );
}
