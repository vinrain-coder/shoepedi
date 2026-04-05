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
  "return_requested",
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
  packed: ["shipped"],
  shipped: ["out_for_delivery", "delivery_exception"],
  out_for_delivery: ["delivered", "delivery_exception"],
  delivered: ["return_requested"],
  cancelled: [],
  returned: [],
  return_requested: ["returned", "delivered"],
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
  return_requested: "Return Requested",
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
  return_requested: "outline",
  delivery_exception: "destructive",
};

export const ORDER_STATUS_COLOR_STYLES: Record<
  OrderTrackingStatus,
  { dot: string; border: string; bg: string; text: string }
> = {
  pending: {
    dot: "bg-slate-400 dark:bg-slate-500",
    border: "border-slate-300 dark:border-slate-700",
    bg: "bg-slate-50 dark:bg-slate-900/50",
    text: "text-slate-700 dark:text-slate-300",
  },
  confirmed: {
    dot: "bg-sky-500 dark:bg-sky-400",
    border: "border-sky-300 dark:border-sky-800",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-700 dark:text-sky-300",
  },
  processing: {
    dot: "bg-indigo-500 dark:bg-indigo-400",
    border: "border-indigo-300 dark:border-indigo-800",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  packed: {
    dot: "bg-violet-500 dark:bg-violet-400",
    border: "border-violet-300 dark:border-violet-800",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-300",
  },
  shipped: {
    dot: "bg-cyan-500 dark:bg-cyan-400",
    border: "border-cyan-300 dark:border-cyan-800",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  out_for_delivery: {
    dot: "bg-amber-500 dark:bg-amber-400",
    border: "border-amber-300 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
  },
  delivered: {
    dot: "bg-emerald-500 dark:bg-emerald-400",
    border: "border-emerald-300 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  cancelled: {
    dot: "bg-rose-500 dark:bg-rose-400",
    border: "border-rose-300 dark:border-rose-800",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
  },
  returned: {
    dot: "bg-zinc-500 dark:bg-zinc-400",
    border: "border-zinc-300 dark:border-zinc-800",
    bg: "bg-zinc-50 dark:bg-zinc-950/30",
    text: "text-zinc-700 dark:text-zinc-300",
  },
  return_requested: {
    dot: "bg-orange-500 dark:bg-orange-400",
    border: "border-orange-300 dark:border-orange-800",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
  },
  delivery_exception: {
    dot: "bg-red-500 dark:bg-red-400",
    border: "border-red-300 dark:border-red-800",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
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
) => {
  if (
    to === "delivered" &&
    !["cancelled", "returned", "delivery_exception"].includes(from)
  ) {
    return true;
  }
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};

export const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(5).toString("hex").toUpperCase();
  return `TRK-${timestamp}-${random}`;
};

export const shouldSendStatusNotification = (status: OrderTrackingStatus) =>
  STATUS_NOTIFICATION_TRIGGERS.has(status);
