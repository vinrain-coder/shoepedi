import { getSetting } from "@/lib/actions/setting.actions";
import { getServerSession } from "@/lib/get-session";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (session?.user) redirect("/");

  const { site } = await getSetting();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={site.logo}
            alt="logo"
            width={60}
            height={60}
            priority
          />
          <h1 className="text-xl font-semibold hover:text-primary">
            {site?.name}
          </h1>
        </Link>
      </div>

      {/* Main content */}
      <div className="w-full">{children}</div>

      {/* Footer */}
      <div className="mt-4 rounded-md bg-gray-900 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center space-x-6 mb-2">
          <Link href="/page/conditions-of-use" className="hover:underline">
            Conditions of Use
          </Link>
          <Link href="/page/privacy-policy" className="hover:underline">
            Privacy Notice
          </Link>
          <Link href="/page/help" className="hover:underline">
            Help
          </Link>
        </div>
        <p>{site?.copyright}</p>
      </div>
    </div>
  );
}
