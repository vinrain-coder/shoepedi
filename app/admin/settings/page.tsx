import { getNoCachedSetting } from "@/lib/actions/setting.actions";
import SettingForm from "./setting-form";
import SettingNav from "./setting-nav";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setting",
};
const SettingPage = async () => {
  return (
    <div className="w-full md:px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="h1-bold text-3xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store configuration, site information, and operational rules.
          </p>
        </div>

        <div className="grid md:grid-cols-6 gap-8">
          <div className="md:col-span-1">
            <SettingNav />
          </div>
          <main className="md:col-span-5">
            <div className="pb-24">
              <SettingForm setting={await getNoCachedSetting()} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
