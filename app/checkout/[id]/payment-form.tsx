"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IOrder } from "@/lib/db/models/order.model";
import { formatDateTime } from "@/lib/utils";
import CheckoutFooter from "../checkout-footer";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { PaystackInline } from "../paystack-inline";

interface OrderDetailsPageProps {
  order: IOrder;
  paystackPublicKey?: string | null;
}

export default function OrderDetailsPage({
  order,
  paystackPublicKey,
}: OrderDetailsPageProps) {
  const {
    shippingAddress,
    items = [],
    totalPrice = 0,
    paymentMethod = "Cash On Delivery",
    expectedDeliveryDate,
  } = order || {};

  const { data: session } = authClient.useSession();

  const CheckoutSummary = ({
    createdOrder,
    paymentMethod,
    handlePlaceOrder,
    totalPrice,
  }: {
    createdOrder: IOrder | null;
    paymentMethod: string;
    handlePlaceOrder: () => void;
    totalPrice: number;
  }) => (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Button logic */}
        {paymentMethod === "Paystack" &&
        createdOrder &&
        session?.user?.email ? (
          <Button
            onClick={() => {
              PaystackInline({
                email: session.user.email,
                amount: Math.round(totalPrice * 100),
                publicKey:
                  paystackPublicKey ||
                  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
                orderId: createdOrder._id,
                onSuccessUrl: `/account/orders/${createdOrder._id}`,
                onCancelUrl: `/account/orders/${createdOrder._id}`,
              });
            }}
            className="rounded-full cursor-pointer"
          >
            Pay Now
          </Button>
        ) : (
          <Button
            onClick={handlePlaceOrder}
            disabled={totalPrice === 0}
            className="rounded-full cursor-pointer"
          >
            Place Your Order
          </Button>
        )}

        <div className="flex-1 mt-4 md:mt-0">
          <p className="font-bold text-lg">
            Order Total: <ProductPrice price={totalPrice} plain />
          </p>
          <p className="text-xs">
            By placing your order, you agree to our{" "}
            <Link href="/page/privacy-policy">privacy notice</Link> and{" "}
            <Link href="/page/conditions-of-use">conditions of use</Link>.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Left section */}
        <div className="md:col-span-3">
          {/* Shipping Address */}
          <div>
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">Shipping Address</div>
              <div className="col-span-2">
                {shippingAddress ? (
                  <p>
                    {shippingAddress.fullName} <br />
                    {shippingAddress.street} <br />
                    {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                  </p>
                ) : (
                  <p>No shipping address provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-y">
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">Payment Method</div>
              <div className="col-span-2">
                <p>{paymentMethod || "Not selected"}</p>
              </div>
            </div>
          </div>

          {/* Items and Shipping */}
          <div className="grid md:grid-cols-3 my-3 pb-3">
            <div className="flex text-lg font-bold">Items and Shipping</div>
            <div className="col-span-2">
              <p>
                Delivery date:{" "}
                {expectedDeliveryDate
                  ? formatDateTime(expectedDeliveryDate)?.dateOnly
                  : "Not set"}
              </p>
              <ul>
                {items.length > 0 ? (
                  items.map((item) => (
                    <li key={item.slug || Math.random()}>
                      {item.name} x {item.quantity} = {item.price}
                    </li>
                  ))
                ) : (
                  <li>No items in this order</li>
                )}
              </ul>
            </div>
          </div>

          {/* Mobile CheckoutSummary */}
          <div className="block md:hidden">
            <CheckoutSummary
              createdOrder={order} // actual order
              paymentMethod={paymentMethod}
              handlePlaceOrder={() => {}}
              totalPrice={totalPrice}
            />
          </div>

          <CheckoutFooter />
        </div>

        {/* Desktop CheckoutSummary */}
        <div className="hidden md:block">
          <CheckoutSummary
            createdOrder={order}
            paymentMethod={paymentMethod}
            handlePlaceOrder={() => {}}
            totalPrice={totalPrice}
          />
        </div>
      </div>
    </main>
  );
}
