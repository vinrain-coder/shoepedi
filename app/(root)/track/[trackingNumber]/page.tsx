import TrackingClient from "./tracking-client";

export const metadata = {
  title: "Track Order",
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="h1-bold">Track your order</h1>
      <TrackingClient trackingNumber={trackingNumber} />
    </main>
  );
}
