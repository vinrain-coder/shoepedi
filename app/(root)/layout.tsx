import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import CriticalRoutesPrefetch from "@/components/shared/navigation/critical-routes-prefetch";
import AffiliateTracker from "@/components/shared/affiliate-tracker";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { affiliate } = await getSetting();
  return (
    <div className="flex flex-col min-h-screen">
      {affiliate?.enabled && (
        <AffiliateTracker cookieExpiryDays={affiliate.cookieExpiryDays} />
      )}
      <CriticalRoutesPrefetch />
      <Header />
      <main className="flex-1 flex flex-col py-4 px-3">{children}</main>
      <Footer />
    </div>
  );
}
