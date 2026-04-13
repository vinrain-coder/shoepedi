import { AddressBookEntry } from "@/types";
import { AddressBookEntrySchema } from "@/lib/validator";

export function normalizeAddressBookEntries(source: unknown): AddressBookEntry[] {
  const entries = Array.isArray(source) ? source : [];

  return entries
    .map((entry) => AddressBookEntrySchema.safeParse(entry))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

