import type { Metadata } from "next";
import TrackOrderForm from "./track-form";

export const metadata: Metadata = {
  title: "Track order",
  description: "Enter your order tracking number to view live order delivery updates.",
  alternates: { canonical: "/track" },
};

export default function TrackLookupPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-4">
      <h1 className="text-3xl font-semibold">Track your order</h1>
      <p className="text-sm text-muted-foreground">
        Paste the tracking number from your confirmation email to view the latest shipping timeline.
      </p>
      <TrackOrderForm />
    </main>
  );
}
