import { randomBytes } from "crypto";

export const ORDER_STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const TERMINAL_ORDER_STATUSES = [
  "cancelled",
  "returned",
  "delivery_exception",
] as const;

export const ORDER_TRACKING_STATUSES = [
  ...ORDER_STATUS_FLOW,
  ...TERMINAL_ORDER_STATUSES,
] as const;

export type OrderTrackingStatus = (typeof ORDER_TRACKING_STATUSES)[number];

export type OrderTrackingHistoryEventInput = {
  status: OrderTrackingStatus;
  message: string;
  location?: string;
  source?: "system" | "admin" | "courier" | "customer";
  metadata?: Record<string, unknown>;
  createdAt?: Date;
};

export const ORDER_STATUS_TRANSITIONS: Record<
  OrderTrackingStatus,
  OrderTrackingStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivery_exception"],
  out_for_delivery: ["delivered", "delivery_exception"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
  delivery_exception: ["out_for_delivery", "returned"],
};

export const ORDER_STATUS_LABELS: Record<OrderTrackingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  delivery_exception: "Delivery exception",
};

export const STATUS_NOTIFICATION_TRIGGERS = new Set<OrderTrackingStatus>([
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "delivery_exception",
]);

export const normalizeOrderStatus = (
  value: string,
): OrderTrackingStatus | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  return ORDER_TRACKING_STATUSES.includes(normalized as OrderTrackingStatus)
    ? (normalized as OrderTrackingStatus)
    : null;
};

export const canTransitionOrderStatus = (
  from: OrderTrackingStatus,
  to: OrderTrackingStatus,
) => ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;

export const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(5).toString("hex").toUpperCase();
  return `TRK-${timestamp}-${random}`;
};

export const shouldSendStatusNotification = (status: OrderTrackingStatus) =>
  STATUS_NOTIFICATION_TRIGGERS.has(status);
