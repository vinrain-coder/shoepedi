"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Package, Star, UserPlus, Warehouse } from "lucide-react";
import { toast } from "sonner";

import {
  AdminNotificationFeed,
  AdminNotificationItem,
  markAdminNotificationsRead,
} from "@/lib/actions/notification.actions";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap = {
  order: Package,
  review: Star,
  "stock-subscription": Warehouse,
  customer: UserPlus,
} as const;

export default function NotificationBellClient({
  initialFeed,
}: {
  initialFeed: AdminNotificationFeed;
}) {
  const router = useRouter();
  const [feed, setFeed] = useState(initialFeed);
  const [isPending, startTransition] = useTransition();

  const unreadCount = feed.unreadCount;

  const hasUnread = unreadCount > 0;

  const groupedLabel = useMemo(() => {
    if (unreadCount === 0) return "All caught up";
    if (unreadCount === 1) return "1 unread alert";
    return `${unreadCount} unread alerts`;
  }, [unreadCount]);

  const handleMarkAllRead = () => {
    if (!hasUnread) return;

    startTransition(async () => {
      const result = await markAdminNotificationsRead();
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setFeed((current) => ({
        ...current,
        unreadCount: 0,
        items: current.items.map((item) => ({ ...item, isUnread: false })),
      }));
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={`Notifications, ${groupedLabel}`}
        >
          <Bell className="size-5" />
          {hasUnread ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-5 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-muted-foreground text-xs">{groupedLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={!hasUnread || isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[420px] overflow-y-auto p-2">
          {feed.items.length > 0 ? (
            <div className="space-y-2">
              {feed.items.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No activity yet.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({ item }: { item: AdminNotificationItem }) {
  const Icon = iconMap[item.type];
  const timestamp = formatDateTime(new Date(item.createdAt));

  return (
    <Link
      href={item.href}
      className={`block rounded-xl border p-3 transition hover:bg-accent/50 ${
        item.isUnread ? "border-primary/40 bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${
            item.isUnread
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-5">{item.title}</p>
            {item.isUnread ? <Badge className="rounded-full px-2">New</Badge> : null}
          </div>
          <p className="text-muted-foreground text-sm leading-5">{item.description}</p>
          <div className="text-muted-foreground flex items-center justify-between gap-3 text-xs">
            <span>{item.meta}</span>
            <span>
              {timestamp.dateOnly} · {timestamp.timeOnly}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
