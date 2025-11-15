"use client";

import { useEffect } from "react";
import useSettingStore from "@/hooks/use-setting-store";
import { ClientSetting } from "@/types";

export default function AppInitializer({
  setting,
    children,
    }: {
      setting: ClientSetting;
        children: React.ReactNode;
        }) {
          // Safe: Write settings to Zustand AFTER initial render
            useEffect(() => {
                useSettingStore.setState({ setting });
                  }, [setting]);

                    return <>{children}</>;
                    }
                    