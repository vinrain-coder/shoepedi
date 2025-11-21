import { Metadata } from "next";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getSetting } from "@/lib/actions/setting.actions";
import { ProfileDetailsForm } from "./profile-form";
import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import Breadcrumb from "@/components/shared/breadcrumb";

const PAGE_TITLE = "Change Your Name";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function ProfilePage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();
  const { site } = await getSetting();

  return (
    <div className="mb-24">
      <Breadcrumb />

      <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>

      <Card className="max-w-2xl">
        <CardContent className="p-4 flex flex-col gap-6">
          <p className="text-sm">
            If you want to change the name associated with your {site.name}
            &apos;s account, you may do so below. Be sure to click the{" "}
            <strong>Save Changes</strong> button when you are done.
          </p>

          <ProfileDetailsForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
