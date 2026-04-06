import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeliveryLocationForm from "../delivery-location-form";
import { getDeliveryLocationById } from "@/lib/actions/delivery-location.actions";

export const metadata: Metadata = {
  title: "Update Delivery Location",
};

export default async function UpdateDeliveryLocationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const deliveryLocation = await getDeliveryLocationById(id);

  if (!deliveryLocation) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1-bold text-center">Update Delivery Location</h1>
        <p className="text-muted-foreground text-center">
          Edit the details of this delivery location
        </p>
      </div>
      <div className="mx-auto flex flex-col items-center justify-center">
        <DeliveryLocationForm type="Update" deliveryLocation={deliveryLocation} deliveryLocationId={id} />
      </div>
    </div>
  );
}
