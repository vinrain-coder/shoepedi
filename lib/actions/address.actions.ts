"use server";

import { revalidatePath } from "next/cache";
import { AddressBookEntry, AddressBookInput } from "@/types";
import { AddressBookInputSchema, AddressBookEntrySchema } from "@/lib/validator";
import { getServerSession } from "@/lib/get-session";
import { getDb } from "@/lib/db/client";
import { formatError } from "@/lib/utils";

const USERS_COLLECTION = "users";

async function getCurrentUserAddresses() {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("You must be signed in");

  const db = await getDb();
  const user = await db.collection(USERS_COLLECTION).findOne(
    { id: session.user.id },
    { projection: { addresses: 1 } }
  );

  const rawAddresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const addresses: AddressBookEntry[] = rawAddresses
    .map((entry) => AddressBookEntrySchema.safeParse(entry))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return {
    session,
    db,
    addresses,
  };
}

export async function getUserAddresses() {
  try {
    const { addresses } = await getCurrentUserAddresses();
    return { success: true, data: addresses };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function upsertUserAddress(
  payload: AddressBookInput,
  options?: { addressId?: string }
) {
  try {
    const { session, db, addresses } = await getCurrentUserAddresses();
    const parsed = AddressBookInputSchema.parse(payload);

    const timestamp = new Date().toISOString();
    const addressId = options?.addressId || crypto.randomUUID();
    const existing = addresses.find((item) => item.id === addressId);

    const normalizedAddress: AddressBookEntry = {
      id: addressId,
      label: parsed.label.trim(),
      fullName: parsed.fullName.trim(),
      street: parsed.street.trim(),
      city: parsed.city.trim(),
      province: parsed.province.trim(),
      country: parsed.country.trim(),
      postalCode: parsed.postalCode.trim(),
      phone: parsed.phone.trim(),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      isDefault: false,
    };

    const shouldSetAsDefault = parsed.saveAsDefault || addresses.length === 0;

    const updatedAddresses = addresses
      .filter((item) => item.id !== addressId)
      .map((item) => ({ ...item, isDefault: shouldSetAsDefault ? false : item.isDefault }));

    normalizedAddress.isDefault = shouldSetAsDefault
      ? true
      : existing?.isDefault ?? false;

    updatedAddresses.push(normalizedAddress);

    if (!updatedAddresses.some((item) => item.isDefault)) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    await db
      .collection(USERS_COLLECTION)
      .updateOne(
        { id: session.user.id },
        { $set: { addresses: updatedAddresses } }
      );

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: existing ? "Address updated successfully" : "Address added successfully",
      data: updatedAddresses,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function removeUserAddress(addressId: string) {
  try {
    const { session, db, addresses } = await getCurrentUserAddresses();
    const updatedAddresses = addresses.filter((item) => item.id !== addressId);

    if (updatedAddresses.length === addresses.length) {
      throw new Error("Address not found");
    }

    if (updatedAddresses.length > 0 && !updatedAddresses.some((item) => item.isDefault)) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    await db
      .collection(USERS_COLLECTION)
      .updateOne(
        { id: session.user.id },
        { $set: { addresses: updatedAddresses } }
      );

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, message: "Address removed", data: updatedAddresses };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function setDefaultUserAddress(addressId: string) {
  try {
    const { session, db, addresses } = await getCurrentUserAddresses();
    if (!addresses.some((item) => item.id === addressId)) {
      throw new Error("Address not found");
    }

    const updatedAddresses = addresses.map((item) => ({
      ...item,
      isDefault: item.id === addressId,
      updatedAt: item.id === addressId ? new Date().toISOString() : item.updatedAt,
    }));

    await db
      .collection(USERS_COLLECTION)
      .updateOne(
        { id: session.user.id },
        { $set: { addresses: updatedAddresses } }
      );

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, message: "Default address updated", data: updatedAddresses };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
