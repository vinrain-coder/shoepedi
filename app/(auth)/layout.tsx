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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icons/logo.svg"
            alt="logo"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-xl font-semibold hover:text-primary">
            {site?.name}
          </h1>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex justify-center px-1">
        <div className="w-full max-w-md p-1">{children}</div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 py-6 text-center text-xs mt-1">
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
