import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/server/actions/order.actions";
import OrderDetailsForm from "@/components/shared/order/order-details-form";
import LinkOrderHandler from "./link-order";
import { formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import Breadcrumb from "@/components/shared/breadcrumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return {
    title: `Order ${formatId(id)}`,
  };
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ accessToken?: string; linkOrder?: string }>;
}) {
  const { id } = await params;
  const { accessToken, linkOrder } = await searchParams;

  const order = await getOrderById(id, accessToken);

  if (!order) notFound();

  const session = await getServerSession();

  return (
    <div>
      {linkOrder === "true" && accessToken && (
        <LinkOrderHandler orderId={id} accessToken={accessToken} />
      )}
      <Breadcrumb />
      <h1 className="h1-bold py-4">Order {formatId(order._id)}</h1>

      <OrderDetailsForm
        order={order}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
