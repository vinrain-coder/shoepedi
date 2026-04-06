"use server";

import { ISettingInput } from "@/types";
import data from "../data";
import Setting from "../db/models/setting.model";
import { connectToDatabase } from "../db";
import { formatError } from "../utils";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";
import { updateTag } from "next/cache";

const withSettingDefaults = (
  setting?: Partial<ISettingInput> | null
): ISettingInput => {
  const fallback = data.settings[0];
  if (!setting) return fallback;

  return {
    ...fallback,
    ...setting,
    common: { ...fallback.common, ...(setting.common ?? {}) },
    site: { ...fallback.site, ...(setting.site ?? {}) },
    affiliate: { ...fallback.affiliate, ...(setting.affiliate ?? {}) },
    notifications: {
      sms: {
        ...fallback.notifications.sms,
        ...(setting.notifications?.sms ?? {}),
      },
    },
  } as ISettingInput;
};

/**
 * Fetch cached settings
 */
export async function getSetting(): Promise<ISettingInput> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  await connectToDatabase();
  const setting = await Setting.findOne().lean();

  return withSettingDefaults(
    setting ? JSON.parse(JSON.stringify(setting)) : null
  );
}

/**
 * Fetch fresh (uncached) settings if needed
 */
export async function getNoCachedSetting(): Promise<ISettingInput> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  await connectToDatabase();
  const setting = await Setting.findOne().lean();
  return withSettingDefaults(
    setting ? JSON.parse(JSON.stringify(setting)) : null
  );
}

/**
 * Update settings and revalidate cache
 */
export async function updateSetting(newSetting: ISettingInput) {
  try {
    await connectToDatabase();

    await Setting.findOneAndUpdate({}, newSetting, {
      upsert: true,
      new: true,
    }).lean();

    // Revalidate cached settings
    updateTag("settings");

    return { success: true, message: "Setting updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
