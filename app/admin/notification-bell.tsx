import { getAdminNotificationFeed } from "@/lib/actions/notification.actions";
import NotificationBellClient from "./notification-bell-client";

export async function NotificationBell() {
  const feed = await getAdminNotificationFeed();

  return <NotificationBellClient initialFeed={feed} />;
}
