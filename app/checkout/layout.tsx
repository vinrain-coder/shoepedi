import { HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { getSetting } from "@/lib/actions/setting.actions";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site } = await getSetting();

  if (site.isMaintenanceMode) {
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") {
      redirect("/maintenance");
    }
  }

  return (
    <div className="p-4">
      <header className="bg-card mb-4 border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-2 py-1 sm:px-4">
          <Link href="/">
            <Image
              src={site.logo}
              alt="logo"
              width={80}
              height={80}
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-xl sm:text-3xl">Checkout</h1>
          </div>
          <div>
            <Link href="/page/help">
              <HelpCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
