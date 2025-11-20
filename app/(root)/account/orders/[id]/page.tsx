import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsForm from "@/components/shared/order/order-details-form";
import { formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";

type Params = {
  params: {
    id: string;
  };
};

// --- Updated Metadata ---
export async function generateMetadata({ params }: Params) {
  return {
    title: `Order ${formatId(params.id)}`,
  };
}

// --- Updated Page Component ---
export default async function OrderDetailsPage({ params }: Params) {
  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await getServerSession();

  return (
    <>
      <div className="flex gap-2">
        <Link href="/account">Your Account</Link>
        <span>›</span>
        <Link href="/account/orders">Your Orders</Link>
        <span>›</span>
        <span>Order {formatId(order._id)}</span>
      </div>

      <h1 className="h1-bold py-4">Order {formatId(order._id)}</h1>

      <OrderDetailsForm
        order={order}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </>
  );
}
