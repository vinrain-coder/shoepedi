import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/get-session";
import Breadcrumb from "@/components/shared/breadcrumb";

const PAGE_TITLE = "Login & Security";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default async function ProfilePage() {
  const session = await getServerSession();

  // ✅ Redirect unauthenticated users
  if (!session?.user) {
    return (
      <div className="py-10 text-center">
        <p>You need to sign in to view this page.</p>
        <Link href="/sign-in">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );

    // OR use hard redirect instead of message page:
    // redirect("/sign-in");
  }

  return (
    <div className="mb-24">
      <Breadcrumb />

      <h1 className="h1-bold py-4">{PAGE_TITLE}</h1>

      <Card className="max-w-2xl">
        {/* Name */}
        <CardContent className="p-4 flex justify-between flex-wrap">
          <div>
            <h3 className="font-bold">Name</h3>
            <p>{session.user.name}</p>
          </div>
          <Link href="/account/manage/name">
            <Button className="rounded-full w-32" variant="outline">
              Edit
            </Button>
          </Link>
        </CardContent>

        <Separator />

        {/* Email */}
        <CardContent className="p-4 flex justify-between flex-wrap">
          <div>
            <h3 className="font-bold">Email</h3>
            <p>{session.user.email}</p>
          </div>
          <Link href="/account/manage/email">
            <Button className="rounded-full w-32" variant="outline">
              Edit
            </Button>
          </Link>
        </CardContent>

        <Separator />

        {/* Password */}
        <CardContent className="p-4 flex justify-between flex-wrap">
          <div>
            <h3 className="font-bold">Password</h3>
            <p>************</p>
          </div>
          <Link href="/account/manage/password">
            <Button className="rounded-full w-32" variant="outline">
              Edit
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
  }
