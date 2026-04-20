"use client";

import Image from "next/image";
import Link from "next/link";

import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "./order-status-badge";
import OrderTimeline from "./order-timeline";
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
  cancelOrder,
  deliverOrder,
  initiateExchange,
  requestReturnOrder,
  SerializedOrder,
  updateOrderStatus,
  updateOrderToPaid,
} from "@/lib/actions/order.actions";
import { formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_TRACKING_STATUSES } from "@/lib/order-tracking";
import ProductPrice from "../product/product-price";
import ActionButton from "../action-button";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PaystackInline = dynamic(() => import("@/app/checkout/paystack-inline"), {
  ssr: false,
});

function CopyTrackingNumber({ trackingNumber }: { trackingNumber: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={handleCopy}
      className="inline-flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      title={copied ? "Copied!" : "Click to copy"}
    >
      <span className="font-medium">{trackingNumber}</span>
      <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {copied && <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>}
    </div>
  );
  }

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
  const [nextStatus, setNextStatus] = useState(order.status);

  const timeline = useMemo(
    () => [...(order.trackingHistory || [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [order.trackingHistory],
  );

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
  const paymentResultInfo = paymentResult as Record<string, string | undefined> | undefined;

  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-5">
      <div className="overflow-x-auto md:col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Shipping Address</h2>
            <p className="text-sm flex items-center gap-2">
              Tracking Number: <CopyTrackingNumber trackingNumber={order.trackingNumber} />
            </p>
            <p className="text-sm flex items-center gap-2">Current Status: <OrderStatusBadge status={order.status} /></p>
            <p className="text-sm"><Link className="underline text-blue-600 underline hover:text-blue-700" href={`/track/${order.trackingNumber}`}>Open tracking page</Link></p>
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
            {paymentResultInfo && (
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Gateway:</span>{" "}
                  {paymentResultInfo.gateway ?? "paystack"}
                </p>
                <p>
                  <span className="font-semibold">Reference:</span>{" "}
                  {paymentResultInfo.paymentReference ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Transaction ID:</span>{" "}
                  {paymentResultInfo.id ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Channel:</span>{" "}
                  {paymentResultInfo.channel ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Currency:</span>{" "}
                  {paymentResultInfo.currency ?? "-"}
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
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Tracking Timeline</h2>
            <OrderTimeline events={timeline} />
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
            {order.coinsRedeemed > 0 && (
              <div className="flex justify-between">
                <span>Coins Redeemed:</span>
                <span className="text-red-600">
                  -{order.coinsRedeemed} coins
                </span>
              </div>
            )}
            {order.coinsEarned > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Coins to be earned:</span>
                <span>+{order.coinsEarned} coins</span>
              </div>
            )}

            <div className="flex justify-between pt-2 font-bold text-lg border-t">
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
              (paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" ||
                paymentMethod === "Cash On Delivery") && (
                <PaystackInline
                  email={(session?.user?.email || order.userEmail) as string}
                  amount={Math.round(totalPrice * 100)}
                  publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                  orderId={orderId}
                  buttonLabel="Pay for this order"
                  className="w-full rounded-full"
                  onSuccess={() => router.refresh()}
                  onFailure={() => router.refresh()}
                />
              )}

            {isAdmin && !isPaid && paymentMethod === "Cash On Delivery" && order.status !== "cancelled" && (
              <ActionButton
                caption="Mark as paid"
                action={() => updateOrderToPaid(orderId)}
              />
            )}
            {isAdmin && !["cancelled", "returned"].includes(order.status) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Order Status</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as typeof order.status)}
                >
                  {ORDER_TRACKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <ActionButton
                  caption="Apply status"
                  action={() => updateOrderStatus({ orderId, status: nextStatus })}
                />
              </div>
            )}
            {isAdmin && isPaid && !isDelivered && order.status !== "cancelled" && (
              <ActionButton
                caption="Quick mark as delivered"
                action={() => deliverOrder(orderId)}
              />
            )}

            {isAdmin && order.status === "returned" && !order.isExchangeInitiated && (
              <ActionButton
                caption="Initiate Exchange"
                variant="outline"
                requireConfirmation
                confirmationMessage="Are you sure you want to initiate an exchange for this order? The customer will be responsible for new delivery costs."
                action={() => initiateExchange(orderId)}
              />
            )}
            {isAdmin && order.isExchangeInitiated && (
              <Badge variant="outline" className="w-full justify-center py-2 border-orange-500 text-orange-600">
                Exchange Processed
              </Badge>
            )}

            {!isAdmin && ["pending", "confirmed", "processing"].includes(order.status) && (
              <ActionButton
                caption="Cancel Order"
                variant="destructive"
                requireConfirmation
                confirmationMessage={
                  order.paymentMethod === "Coins"
                    ? "Are you sure you want to cancel this order? Any paid amount will be returned to your coin balance."
                    : "Are you sure you want to cancel this order? Any paid amount will be refunded to your wallet."
                }
                action={() => cancelOrder(orderId)}
              />
            )}

            {!isAdmin && order.status === "delivered" && order.deliveredAt && (
              (() => {
                const deliveredDate = new Date(order.deliveredAt);
                const sevenDaysLater = new Date(deliveredDate);
                sevenDaysLater.setDate(deliveredDate.getDate() + 7);
                const isWithinWindow = new Date() <= sevenDaysLater;

                return isWithinWindow ? (
                  <ActionButton
                    caption="Return Order"
                    variant="outline"
                    requireConfirmation
                    confirmationMessage="Are you sure you want to request a return for this order? Returns must be approved by an admin."
                    action={() => requestReturnOrder(orderId)}
                  />
                ) : null;
              })()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
