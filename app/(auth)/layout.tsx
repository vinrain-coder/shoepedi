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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-center py-6 mt-2">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icons/logo.svg"
            alt="logo"
            width={48} // slightly smaller for balance
            height={48}
            priority
          />
          <h1 className="text-3xl font-semibold text-gray-900 hover:text-primary">
            {site?.name}
          </h1>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 -mt-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-xs mt-4">
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
      </footer>
    </div>
  );
}
