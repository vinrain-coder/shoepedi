"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import DeliveryLocation from "../db/models/delivery-location.model";
import { DeliveryLocationInputSchema, DeliveryLocationUpdateSchema } from "../validator";
import { formatError } from "../utils";
import { z } from "zod";
import { getServerSession } from "../get-session";

type DeliveryLocationInput = z.infer<typeof DeliveryLocationInputSchema>;
type DeliveryLocationUpdate = z.infer<typeof DeliveryLocationUpdateSchema>;

async function checkAdmin() {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }
}

export async function createDeliveryLocation(data: DeliveryLocationInput) {
  try {
    await checkAdmin();
    await connectToDatabase();
    const validated = DeliveryLocationInputSchema.parse(data);
    const deliveryLocation = await DeliveryLocation.create(validated);
    revalidatePath("/admin/delivery-locations");
    return {
      success: true,
      message: "Delivery location created successfully",
      data: JSON.parse(JSON.stringify(deliveryLocation)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateDeliveryLocation(data: DeliveryLocationUpdate) {
  try {
    await checkAdmin();
    await connectToDatabase();
    const validated = DeliveryLocationUpdateSchema.parse(data);
    const { _id, ...updateData } = validated;
    const deliveryLocation = await DeliveryLocation.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!deliveryLocation) throw new Error("Delivery location not found");
    revalidatePath("/admin/delivery-locations");
    return {
      success: true,
      message: "Delivery location updated successfully",
      data: JSON.parse(JSON.stringify(deliveryLocation)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteDeliveryLocation(id: string) {
  try {
    await checkAdmin();
    await connectToDatabase();
    const deliveryLocation = await DeliveryLocation.findByIdAndDelete(id);
    if (!deliveryLocation) throw new Error("Delivery location not found");
    revalidatePath("/admin/delivery-locations");
    return {
      success: true,
      message: "Delivery location deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllDeliveryLocations() {
  try {
    await connectToDatabase();
    const deliveryLocations = await DeliveryLocation.find().sort({ county: 1, city: 1 });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(deliveryLocations)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getDeliveryLocationById(id: string) {
  try {
    await connectToDatabase();
    const deliveryLocation = await DeliveryLocation.findById(id);
    if (!deliveryLocation) throw new Error("Delivery location not found");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(deliveryLocation)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getUniqueCounties() {
  try {
    await connectToDatabase();
    const counties = await DeliveryLocation.distinct("county");
    return {
      success: true,
      data: counties.sort(),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getCitiesByCounty(county: string) {
  try {
    await connectToDatabase();
    const locations = await DeliveryLocation.find({ county }).select("city rates").sort({ city: 1 });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(locations)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
