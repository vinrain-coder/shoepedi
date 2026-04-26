"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Loader2,
  Package,
  Star,
  UserPlus,
  Warehouse,
  MessageSquareMore,
  Users,
  HandCoins,
} from "lucide-react";
import { toast } from "sonner";

import {
  AdminNotificationFeed,
  AdminNotificationItem,
  markAdminNotificationsRead,
} from "@/lib/actions/notification.actions";
import { cn, formatDateTime } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  support: MessageSquareMore,
  affiliate: Users,
  "affiliate-payout": HandCoins,
  "wallet-payout": HandCoins,
} as const;

const getRelativeTimestamp = (date: Date, now: number) => {
  const diffInMinutes = Math.max(0, Math.floor((now - date.getTime()) / 60000));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDateTime(date).dateOnly;
};

export default function NotificationBellClient({
  initialFeed,
}: {
  initialFeed: AdminNotificationFeed;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [feed, setFeed] = useState(initialFeed);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setFeed(initialFeed);
  }, [initialFeed]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const unreadCount = feed.unreadCount;
  const hasUnread = unreadCount > 0;

  const groupedLabel = useMemo(() => {
    if (unreadCount === 0) return "All caught up";
    if (unreadCount === 1) return "1 unread alert";
    return `${unreadCount} unread alerts`;
  }, [unreadCount]);

  const markAllAsReadOptimistically = () => {
    setFeed((current) => ({
      ...current,
      unreadCount: 0,
      items: current.items.map((item) => ({ ...item, isUnread: false })),
    }));
  };

  const handleMarkAllRead = () => {
    if (!hasUnread) return;

    const previousFeed = feed;
    markAllAsReadOptimistically();

    startTransition(async () => {
      const result = await markAdminNotificationsRead();
      if (!result.success) {
        setFeed(previousFeed);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  };

  const handleNotificationSelect = (selectedItem: AdminNotificationItem) => {
    const previousFeed = feed;

    setIsOpen(false);
    setFeed((current) => {
      if (
        !current.items.some(
          (item) => item.id === selectedItem.id && item.isUnread,
        )
      ) {
        return current;
      }

      return {
        ...current,
        unreadCount: Math.max(0, current.unreadCount - 1),
        items: current.items.map((item) =>
          item.id === selectedItem.id ? { ...item, isUnread: false } : item,
        ),
      };
    });

    router.push(selectedItem.href);

    startTransition(async () => {
      const result = await markAdminNotificationsRead();
      if (!result.success) {
        setFeed(previousFeed);
        toast.error(result.message);
        return;
      }

      router.refresh();
    });
  };

  const trigger = (
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
  );

  const content = (
    <NotificationFeedPanel
      feed={feed}
      groupedLabel={groupedLabel}
      hasUnread={hasUnread}
      isPending={isPending}
      now={now}
      onMarkAllRead={handleMarkAllRead}
      onNotificationSelect={handleNotificationSelect}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh] p-0">
          <DrawerHeader className="border-b px-4 pb-4 pt-3 text-left">
            <DrawerTitle className="text-base">Notifications</DrawerTitle>
            <DrawerDescription>{groupedLabel}</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(92vw,28rem)] overflow-hidden p-0"
      >
        <DropdownMenuLabel className="sr-only">Notifications</DropdownMenuLabel>
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationFeedPanel({
  feed,
  groupedLabel,
  hasUnread,
  isPending,
  now,
  onMarkAllRead,
  onNotificationSelect,
}: {
  feed: AdminNotificationFeed;
  groupedLabel: string;
  hasUnread: boolean;
  isPending: boolean;
  now: number;
  onMarkAllRead: () => void;
  onNotificationSelect: (item: AdminNotificationItem) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 pr-2">
          <p className="font-semibold">Admin alerts</p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {groupedLabel}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={!hasUnread || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCheck className="size-4" />
          )}
          Mark all read
        </Button>
      </div>
      <DropdownMenuSeparator className="m-0" />
      <div className="max-h-[min(70vh,28rem)] overflow-y-auto px-2 pb-4 pt-2 sm:px-3 sm:pb-6 sm:pt-3">
        {feed.items.length > 0 ? (
          <div className="space-y-2 pb-2 sm:pb-3">
            {feed.items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                now={now}
                onSelect={onNotificationSelect}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No activity yet.
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  now,
  onSelect,
}: {
  item: AdminNotificationItem;
  now: number;
  onSelect: (item: AdminNotificationItem) => void;
}) {
  const Icon = iconMap[item.type];
  const createdAt = new Date(item.createdAt);
  const timestamp = formatDateTime(createdAt);
  const relativeTimestamp = getRelativeTimestamp(createdAt, now);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "group block w-full rounded-2xl border p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-accent/40 hover:shadow-md sm:p-4",
        item.isUnread
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-background",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
            item.isUnread
              ? "border-primary/20 bg-primary text-primary-foreground"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold leading-5">{item.title}</p>
                {item.isUnread ? (
                  <Badge className="rounded-full px-2">New</Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground text-sm leading-5 wrap-break-word">
                {item.description}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground hidden size-4 shrink-0 transition group-hover:translate-x-0.5 sm:block" />
          </div>
          <div className="text-muted-foreground flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span className="font-medium">{item.meta}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:justify-end">
              <span className="font-medium">{relativeTimestamp}</span>
              <span className="hidden sm:inline">·</span>
              <span>
                {timestamp.dateOnly} · {timestamp.timeOnly}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
