"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { OrderTrackingStatus } from "@/lib/order-tracking";
import { OrderStatusBadge } from "@/components/shared/order/order-status-badge";
import OrderTimeline from "@/components/shared/order/order-timeline";
import ProductPrice from "@/components/shared/product/product-price";

type TrackingPayload = {
  _id: string;
  trackingNumber: string;
  status: OrderTrackingStatus;
  expectedDeliveryDate?: Date;
  shipment?: {
    courierName?: string;
    courierTrackingReference?: string;
    estimatedDeliveryDate?: Date;
  };
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  couponDiscount: number;
  totalPrice: number;
  trackingHistory: Array<{
    status: OrderTrackingStatus;
    message: string;
    location?: string;
    createdAt: Date;
  }>;
};

export default function TrackingClient({
  trackingNumber,
}: {
  trackingNumber: string;
}) {
  const [data, setData] = useState<TrackingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTracking = async () => {
      const response = await fetch(
        `/api/tracking/${encodeURIComponent(trackingNumber)}`,
        {
          cache: "no-store",
        }
      );
      const payload = await response.json();
      if (!mounted) return;

      if (!response.ok) {
        setError(payload?.message || "Unable to fetch tracking details.");
        return;
      }

      setError(null);
      setData(payload.data);
    };

    fetchTracking();
    const intervalId = setInterval(fetchTracking, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [trackingNumber]);

  const timeline = useMemo(
    () =>
      [...(data?.trackingHistory || [])].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
    [data]
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-red-600">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4">Loading tracking details…</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Tracking #{data.trackingNumber}</p>
              <OrderStatusBadge status={data.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Estimated delivery:{" "}
              {
                formatDateTime(
                  new Date(
                    data.shipment?.estimatedDeliveryDate ||
                      data.expectedDeliveryDate ||
                      new Date()
                  )
                ).dateTime
              }
            </p>
            <p className="text-sm">
              Courier: {data.shipment?.courierName || "Pending assignment"}
              {data.shipment?.courierTrackingReference
                ? ` • Ref: ${data.shipment.courierTrackingReference}`
                : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-lg font-semibold">Order timeline</h2>
            <OrderTimeline events={timeline} />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">Order summary</h2>
            {data.items.map((item, index) => (
              <p key={`${item.name}-${index}`} className="text-sm">
                {item.name} × {item.quantity}
              </p>
            ))}
            <div className="pt-2 text-sm space-y-1">
              <p>
                Items: <ProductPrice price={data.itemsPrice} plain />
              </p>
              <p>
                Shipping: <ProductPrice price={data.shippingPrice} plain />
              </p>
              <p>
                Tax: <ProductPrice price={data.taxPrice} plain />
              </p>
              <p>
                Discount: <ProductPrice price={data.couponDiscount} plain />
              </p>
              <p className="font-semibold">
                Total: <ProductPrice price={data.totalPrice} plain />
              </p>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Deliver to {data.shippingAddress.fullName},{" "}
              {data.shippingAddress.street}, {data.shippingAddress.city},{" "}
              {data.shippingAddress.country}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
