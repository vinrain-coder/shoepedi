import { Metadata } from "next";
import CheckoutForm from "./checkout-form";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getUserAddresses } from "@/lib/actions/address.actions";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ selectedAddressId?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }
  const { selectedAddressId } = await searchParams;
  const addressesResult = await getUserAddresses();
  return (
    <CheckoutForm
      savedAddresses={addressesResult.success ? addressesResult.data ?? [] : []}
      selectedAddressId={selectedAddressId}
    />
  );
}
