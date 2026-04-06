import Link from "next/link";
import { Metadata } from "next";
import DeliveryLocationForm from "../delivery-location-form";

export const metadata: Metadata = {
  title: "Create Delivery Location",
};

const CreateDeliveryLocationPage = async () => {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/delivery-locations">Delivery Locations</Link>
        <span className="mx-1">›</span>
        <span>Create</span>
      </div>

      <div className="my-8">
        <h1 className="h1-bold text-3xl mb-4">Create Delivery Location</h1>
        <DeliveryLocationForm type="Create" />
      </div>
    </main>
  );
};

export default CreateDeliveryLocationPage;
