import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";
import Breadcrumb from "@/components/shared/breadcrumb";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { AccountOverviewTabs } from "@/components/shared/account/account-overview-tabs";
import { Metadata } from "next";

const PAGE_TITLE = "Your Account";
export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(toSignInPath("/account"));
  }

  return (
    <div>
      <Breadcrumb />
      <div className="mb-4 mt-3 space-y-1">
        <h1 className="h1-bold">{PAGE_TITLE}</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account in one place with quick tabs for orders, security, and content.
        </p>
      </div>

      <AccountOverviewTabs />

      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
