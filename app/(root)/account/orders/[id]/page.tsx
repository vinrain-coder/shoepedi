import { notFound } from "next/navigation";

import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsForm from "@/components/shared/order/order-details-form";
import { formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import Breadcrumb from "@/components/shared/breadcrumb";

type Params = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Params) {
  return {
    title: `Order ${formatId(params.id)}`,
  };
}

export default async function OrderDetailsPage({ params }: Params) {
  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await getServerSession();

  return (
    <>
      <Breadcrumb />
      <h1 className="h1-bold py-4">Order {formatId(order._id)}</h1>

      <OrderDetailsForm
        order={order}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </>
  );
}
