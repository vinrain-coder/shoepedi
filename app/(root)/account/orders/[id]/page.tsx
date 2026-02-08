import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsForm from "@/components/shared/order/order-details-form";
import { formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Order ${formatId(params.id)}`,
  };
}

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const order = await getOrderById(id);

  if (!order) notFound();

  const session = await getServerSession();

  return (
    <div>
      <h1 className="h1-bold py-4">Order {formatId(order.id)}</h1>

      <OrderDetailsForm
        order={order}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
