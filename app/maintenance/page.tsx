import React from "react";
import { Hammer } from "lucide-react";
import { getSetting } from "@/lib/actions/setting.actions";
import Image from "next/image";

export default async function MaintenancePage() {
  const { site } = await getSetting();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src={site.logo}
              alt={site.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Hammer className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Under Maintenance
          </h1>
          <p className="text-muted-foreground text-lg">
            taxPrice, taxPrice, taxPrice, taxPrice,
            {site.name} is currently undergoing scheduled maintenance to improve
            your shopping experience. We&apos;ll be back online shortly.
          </p>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Thank you for your patience. For urgent inquiries, please contact us
            at:
            <br />
            <a
              href={`mailto:${site.email}`}
              className="text-primary hover:underline font-medium"
            >
              {site.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
