import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "@/lib/get-session";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import Breadcrumb from "@/components/shared/breadcrumb";
import { User, Mail, Lock } from "lucide-react";

const PAGE_TITLE = "Login & Security";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

function Row({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: any;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-muted/50 transition">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-sm text-muted-foreground break-all">{value}</p>
        </div>
      </div>

      <Link href={href}>
        <Button
          variant="outline"
          className="rounded-full"
        >
          Edit
        </Button>
      </Link>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await getServerSession();

  return (
    <div className="mb-24">
      <Breadcrumb />

      <div className="mb-6 mt-2">
        <h1 className="font-bold tracking-tight">{PAGE_TITLE}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account details and security settings
        </p>
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-2">
          <Row
            icon={User}
            title="Name"
            value={session?.user?.name ?? "-"}
            href="/account/manage/name"
          />

          <Separator />

          <Row
            icon={Mail}
            title="Email"
            value={session?.user?.email ?? "-"}
            href="/account/manage/email"
          />

          <Separator />

          <Row
            icon={Lock}
            title="Password"
            value="************"
            href="/account/manage/password"
          />
        </CardContent>
      </Card>
    </div>
  );
}
