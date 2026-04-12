import { getServerSession } from "@/lib/get-session";
import { toSignInPath } from "@/lib/redirects";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-2">
      <div className="mx-auto max-w-5xl space-y-4">{children}</div>
    </div>
  );
}
