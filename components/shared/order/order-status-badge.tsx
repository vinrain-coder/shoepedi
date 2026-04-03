import { OrderTrackingStatus, ORDER_STATUS_COLOR_STYLES, ORDER_STATUS_LABELS } from "@/lib/order-tracking";
import { CheckCircle2, Clock, Package, Truck, ArrowUpRight, XCircle } from "lucide-react";

const STATUS_ICONS: Record<OrderTrackingStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle2 className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  packed: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  out_for_delivery: <ArrowUpRight className="w-4 h-4" />,
  delivered: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  returned: <ArrowUpRight className="w-4 h-4" />,
  delivery_exception: <XCircle className="w-4 h-4" />,
};

export function OrderStatusBadge({ status }: { status: OrderTrackingStatus }) {
  const style = ORDER_STATUS_COLOR_STYLES[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${style.border} ${style.bg} ${style.text} shadow-sm`}
    >
      <span className={`${style.dot} w-2 h-2 rounded-full`} />
      <span className="flex items-center gap-1">
        {STATUS_ICONS[status]}
        {ORDER_STATUS_LABELS[status]}
      </span>
    </div>
  );
}
