"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IOrder } from "@/lib/db/models/order.model";
import { formatDateTime } from "@/lib/utils";

import CheckoutFooter from "../checkout-footer";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProductPrice from "@/components/shared/product/product-price";
import { toast } from "sonner";
import { PaystackButton } from "react-paystack";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth-client";

const PaystackInline = dynamic(
  () => import("../paystack-inline"),
  { ssr: false } // <-- only render on the client
);

export default function OrderDetailsForm({
  order,
  paystackPublicKey,
}: {
  order: IOrder;
  isAdmin: boolean;
  clientSecret: string | null;
  paystackPublicKey?: string | null;
}) {
  const { data: session } = authClient.useSession();

  const router = useRouter();
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order;

  if (isPaid) {
    redirect(`/account/orders/${order._id}`);
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        <div>
          <div className="text-lg font-bold">Order Summary</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>
                {" "}
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined ? (
                  "--"
                ) : shippingPrice === 0 ? (
                  "FREE"
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span> Tax:</span>
              <span>
                {taxPrice === undefined ? (
                  "--"
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className="flex justify-between  pt-1 font-bold text-lg">
              <span> Order Total:</span>
              <span>
                {" "}
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>

            {!isPaid && paymentMethod === "Paystack" && (
              <PaystackInline
                email={session?.user.email as string}
                amount={Math.round(totalPrice * 100)}
                publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                orderId={order._id}
                onSuccess={() => router.push(`/account/orders/${order._id}`)}
              />
            )}

            {!isPaid && paymentMethod === "Cash On Delivery" && (
              <Button
                className="w-full rounded-full cursor-pointer"
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                View Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* Shipping Address */}
          <div>
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">
                <span>Shipping Address</span>
              </div>
              <div className="col-span-2">
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                </p>
              </div>
            </div>
          </div>

          {/* payment method */}
          <div className="border-y">
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">
                <span>Payment Method</span>
              </div>
              <div className="col-span-2">
                <p>{paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 my-3 pb-3">
            <div className="flex text-lg font-bold">
              <span>Items and shipping</span>
            </div>
            <div className="col-span-2">
              <p>
                Delivery date:
                {formatDateTime(expectedDeliveryDate).dateOnly}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="block md:hidden">
            <CheckoutSummary />
          </div>

          <CheckoutFooter />
        </div>
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
