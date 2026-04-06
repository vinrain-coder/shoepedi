import { Hammer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function MaintenancePage() {
  const { site } = await getSetting();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src="/icons/logo.svg"
              alt={site.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="bg-primary/10 p-4 rounded-full">
            <Hammer className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Under Maintenance
          </h1>
          <p className="text-xl text-muted-foreground">
            We&apos;re currently performing some scheduled maintenance to improve our site. We&apos;ll be back shortly!
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Thank you for your patience. If you need immediate assistance, please reach out to us at:
          </p>
          <p className="font-semibold text-primary">{site.email}</p>
        </div>

        <div className="pt-8">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto px-12 rounded-full">
              Check Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
