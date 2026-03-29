"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deliverOrder,
  SerializedOrder,
  updateOrderToPaid,
} from "@/lib/actions/order.actions";
import { formatDateTime } from "@/lib/utils";
import ProductPrice from "../product/product-price";
import ActionButton from "../action-button";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const PaystackInline = dynamic(() => import("@/app/checkout/paystack-inline"), {
  ssr: false,
});

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: SerializedOrder;
  isAdmin: boolean;
}) {
  const orderId = order._id;
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
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
    paymentResult,
  } = order;

  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-5">
      <div className="overflow-x-auto md:col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Shipping Address</h2>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{" "}
              {shippingAddress.province}, {shippingAddress.postalCode},{" "}
              {shippingAddress.country}{" "}
            </p>

            {isDelivered ? (
              <Badge>
                Delivered at {formatDateTime(deliveredAt!).dateTime}
              </Badge>
            ) : (
              <div>
                {" "}
                <Badge variant="destructive">Not delivered</Badge>
                <div>
                  Expected delivery at{" "}
                  {formatDateTime(expectedDeliveryDate!).dateTime}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Payment Method</h2>
            <p>{paymentMethod}</p>
            {isPaid ? (
              <Badge>Paid at {formatDateTime(paidAt!).dateTime}</Badge>
            ) : (
              <Badge variant="destructive">Not paid</Badge>
            )}
            {paymentResult && (
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Gateway:</span>{" "}
                  {paymentResult.gateway ?? "paystack"}
                </p>
                <p>
                  <span className="font-semibold">Reference:</span>{" "}
                  {paymentResult.paymentReference ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Transaction ID:</span>{" "}
                  {paymentResult.id ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Channel:</span>{" "}
                  {paymentResult.channel ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Currency:</span>{" "}
                  {paymentResult.currency ?? "-"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug + item.size + item.color}>
                    <TableCell className="truncate">
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-md"
                        />
                        <span className="px-2 font-medium">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{item.size || "-"}</TableCell>
                    <TableCell>{item.color || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      <ProductPrice price={item.price} plain />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className="p-4 space-y-4 gap-4">
            <h2 className="text-xl pb-4">Order Summary</h2>
            <div className="flex justify-between">
              <div>Items</div>
              <div>
                {" "}
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            <div className="flex justify-between">
              <div>Tax</div>
              <div>
                {" "}
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            <div className="flex justify-between">
              <div>Shipping</div>
              <div>
                {" "}
                <ProductPrice price={shippingPrice} plain />
              </div>
            </div>
            {order.coupon && (
              <div className="flex justify-between">
                <span>Coupon ({order.coupon.code}):</span>
                <span className="text-green-600">
                  -<ProductPrice price={order.coupon.discountAmount} plain />
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2 font-bold text-lg">
              <span>Order Total:</span>
              <span>
                <ProductPrice
                  price={totalPrice}
                  plain
                />
              </span>
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href={`/api/orders/${orderId}/receipt`} download>
                Download order receipt (PDF)
              </a>
            </Button>
            {!isPaid &&
              paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" && (
                <PaystackInline
                  email={session?.user.email as string}
                  amount={Math.round(totalPrice * 100)}
                  publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                  orderId={orderId}
                  buttonLabel="Pay for this order"
                  className="w-full rounded-full"
                  onSuccess={() => router.refresh()}
                  onFailure={() => router.refresh()}
                />
              )}

            {isAdmin && !isPaid && paymentMethod === "Cash On Delivery" && (
              <ActionButton
                caption="Mark as paid"
                action={() => updateOrderToPaid(orderId)}
              />
            )}
            {isAdmin && isPaid && !isDelivered && (
              <ActionButton
                caption="Mark as delivered"
                action={() => deliverOrder(orderId)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
