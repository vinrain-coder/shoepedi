import { formatDateTime } from "@/lib/utils";
import {
  ORDER_STATUS_COLOR_STYLES,
  ORDER_STATUS_LABELS,
  OrderTrackingStatus,
} from "@/lib/order-tracking";

type TimelineEvent = {
  status: OrderTrackingStatus;
  message: string;
  location?: string;
  createdAt: Date | string;
};

export default function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No tracking events have been recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event, idx) => {
        const style = ORDER_STATUS_COLOR_STYLES[event.status];
        const createdAt = new Date(event.createdAt);

        return (
          <li key={`${event.status}-${createdAt.toISOString()}-${idx}`} className="relative pl-8">
            <span className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-offset-2 ring-offset-background">
              <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
            </span>

            {idx !== events.length - 1 ? (
              <span className="absolute left-[7px] top-6 h-[calc(100%+0.6rem)] w-px bg-border" />
            ) : null}

            <div className={`rounded-lg border px-3 py-2 ${style.border} ${style.bg}`}>
              <p className={`text-sm font-semibold ${style.text}`}>
                {ORDER_STATUS_LABELS[event.status]}
              </p>
              <p className="text-sm text-foreground/90">{event.message}</p>
              {event.location ? (
                <p className="text-xs text-muted-foreground">{event.location}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {formatDateTime(createdAt).dateTime}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
