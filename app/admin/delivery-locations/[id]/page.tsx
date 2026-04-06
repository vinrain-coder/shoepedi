import Link from "next/link";
import { Metadata } from "next";
import DeliveryLocationForm from "../delivery-location-form";
import { getDeliveryLocationById } from "@/lib/actions/delivery-location.actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Update Delivery Location",
};

const UpdateDeliveryLocationPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const res = await getDeliveryLocationById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const deliveryLocation = res.data;

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/delivery-locations">Delivery Locations</Link>
        <span className="mx-1">›</span>
        <span>Edit</span>
      </div>

      <div className="my-8">
        <h1 className="h1-bold text-3xl mb-4">Edit Delivery Location</h1>
        <DeliveryLocationForm type="Update" deliveryLocation={deliveryLocation} deliveryLocationId={id} />
      </div>
    </main>
  );
};

export default UpdateDeliveryLocationPage;
