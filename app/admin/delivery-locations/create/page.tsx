import { Metadata } from "next";
import DeliveryLocationForm from "../delivery-location-form";

export const metadata: Metadata = {
  title: "Create Delivery Location",
};

export default function CreateDeliveryLocationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1-bold text-center">Create Delivery Location</h1>
        <p className="text-muted-foreground text-center">
          Add a new delivery location and its base rate
        </p>
      </div>
      <div className="mx-auto flex flex-col items-center justify-center">
        <DeliveryLocationForm type="Create" />
      </div>
    </div>
  );
}
