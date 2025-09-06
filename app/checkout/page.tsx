import { Metadata } from "next";
import CheckoutForm from "./checkout-form";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }
  return <CheckoutForm />;
}
