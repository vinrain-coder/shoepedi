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

export const ORDER_STATUS_BADGE_VARIANTS: Record<
  OrderTrackingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  packed: "default",
  shipped: "default",
  out_for_delivery: "default",
  delivered: "default",
  cancelled: "destructive",
  returned: "outline",
  delivery_exception: "destructive",
};

export const ORDER_STATUS_COLOR_STYLES: Record<
  OrderTrackingStatus,
  { dot: string; border: string; bg: string; text: string }
> = {
  pending: {
    dot: "bg-slate-400",
    border: "border-slate-300",
    bg: "bg-slate-50",
    text: "text-slate-700",
  },
  confirmed: {
    dot: "bg-sky-500",
    border: "border-sky-300",
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  processing: {
    dot: "bg-indigo-500",
    border: "border-indigo-300",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  packed: {
    dot: "bg-violet-500",
    border: "border-violet-300",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  shipped: {
    dot: "bg-cyan-500",
    border: "border-cyan-300",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  out_for_delivery: {
    dot: "bg-amber-500",
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  delivered: {
    dot: "bg-emerald-500",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  cancelled: {
    dot: "bg-rose-500",
    border: "border-rose-300",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  returned: {
    dot: "bg-zinc-500",
    border: "border-zinc-300",
    bg: "bg-zinc-50",
    text: "text-zinc-700",
  },
  delivery_exception: {
    dot: "bg-red-500",
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-700",
  },
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
