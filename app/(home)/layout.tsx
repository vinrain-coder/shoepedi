import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { getSetting } from "@/lib/actions/setting.actions";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { common } = await getSetting();

  if (common.isMaintenanceMode) {
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") {
      redirect("/maintenance");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
