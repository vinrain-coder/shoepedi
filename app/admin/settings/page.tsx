import { getNoCachedSetting } from "@/lib/actions/setting.actions";
import SettingForm from "./setting-form";
import SettingNav from "./setting-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Settings",
};

export default async function AdminSettingPage() {
  const setting = await getNoCachedSetting();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-primary">System Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure site-wide preferences, branding, and operational rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <SettingNav />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="max-w-4xl">
            <SettingForm setting={setting} />
          </div>
        </div>
      </div>
    </div>
  );
}
