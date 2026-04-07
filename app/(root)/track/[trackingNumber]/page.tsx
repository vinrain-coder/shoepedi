import type { Metadata } from "next";
import TrackingClient from "./tracking-client";
import Breadcrumb from "@/components/shared/breadcrumb";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Live delivery updates for your order.",
  alternates: { canonical: "/track" },
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;

  return (
    <main className="max-w-5xl mx-auto space-y-4">
      <Breadcrumb />
      <h1 className="h1-bold">Track your order</h1>
      <TrackingClient trackingNumber={trackingNumber} />
    </main>
  );
}
