import { SessionGuard } from "@/components/shared/session-guard";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import React from "react";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SessionGuard>
    <div className=" flex-1 p-4">
      <div className="max-w-5xl mx-auto space-y-4">{children}</div>
    </div>
    </SessionGuard>
  );
}
