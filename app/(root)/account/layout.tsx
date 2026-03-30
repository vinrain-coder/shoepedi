import { AccountNav } from "@/components/shared/account/account-nav";
import { getServerSession } from "@/lib/get-session";
import { toSignInPath } from "@/lib/redirects";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(toSignInPath("/account"));
  }

  return (
    <div className="flex-1 p-2">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[260px_1fr]">
        <aside className="md:sticky md:top-20 md:self-start">
          <AccountNav />
        </aside>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
