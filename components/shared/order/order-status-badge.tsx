import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_BADGE_VARIANTS,
  ORDER_STATUS_LABELS,
  OrderTrackingStatus,
} from "@/lib/order-tracking";

export function OrderStatusBadge({ status }: { status: OrderTrackingStatus }) {
  return (
    <Badge variant={ORDER_STATUS_BADGE_VARIANTS[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
