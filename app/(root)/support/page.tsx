import type { Metadata } from "next";
import SupportTicketForm from "@/components/shared/support/support-ticket-form";
import { getServerSession } from "@/lib/get-session";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your orders, payments, returns, and account questions.",
  alternates: { canonical: "/support" },
};

export default async function PublicSupportPage() {
  const session = await getServerSession();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 py-4">
      <h1 className="text-3xl font-semibold">Customer support</h1>
      <p className="text-sm text-muted-foreground">
        Need help? Submit a support ticket and we&apos;ll reply by email.
      </p>
      <SupportTicketForm
        initialName={session?.user?.name || ""}
        initialEmail={session?.user?.email || ""}
      />
    </main>
  );
}
