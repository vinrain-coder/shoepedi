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
    <div className=" flex-1 p-2">
      <div className="max-w-5xl mx-auto space-y-4">{children}</div>
    </div>
  );
}
