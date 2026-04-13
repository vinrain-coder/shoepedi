import { AddressBookEntry } from "@/types";
import { AddressBookEntrySchema } from "@/lib/validator";

export function normalizeAddressBookEntries(source: unknown): AddressBookEntry[] {
  const entries = Array.isArray(source) ? source : [];

  const parsedEntries = entries
    .map((entry) => AddressBookEntrySchema.safeParse(entry))
    .filter((result) => result.success)
    .map((result) => result.data);

  const byId = new Map<string, AddressBookEntry>();
  const seenFingerprints = new Set<string>();

  for (const entry of parsedEntries) {
    const normalizedFingerprint = [
      entry.fullName.trim().toLowerCase(),
      entry.street.trim().toLowerCase(),
      entry.city.trim().toLowerCase(),
      entry.province.trim().toLowerCase(),
      entry.postalCode.trim().toLowerCase(),
      entry.country.trim().toLowerCase(),
      entry.phone.trim().toLowerCase(),
    ].join("|");

    const existingById = byId.get(entry.id);
    if (existingById) {
      const existingUpdatedAt = new Date(existingById.updatedAt).getTime();
      const currentUpdatedAt = new Date(entry.updatedAt).getTime();
      if (currentUpdatedAt >= existingUpdatedAt) {
        byId.set(entry.id, entry);
      }
      continue;
    }

    if (seenFingerprints.has(normalizedFingerprint)) {
      continue;
    }

    seenFingerprints.add(normalizedFingerprint);
    byId.set(entry.id, entry);
  }

  const dedupedEntries = Array.from(byId.values()).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  if (dedupedEntries.length > 0 && !dedupedEntries.some((entry) => entry.isDefault)) {
    dedupedEntries[0] = { ...dedupedEntries[0], isDefault: true };
  }

  return dedupedEntries.map((entry, index) => ({
    ...entry,
    isDefault: index === 0,
  }));
}
