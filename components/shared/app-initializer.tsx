"use client";

import React, { useEffect } from "react";
import useSettingStore from "@/hooks/use-setting-store";
import { ClientSetting } from "@/types";

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting;
  children: React.ReactNode;
}) {
  const setSetting = useSettingStore((s) => s.setSetting);

  useEffect(() => {
    // Safe – runs AFTER render, not during
    setSetting(setting);
  }, [setting, setSetting]);

  return children;
}
