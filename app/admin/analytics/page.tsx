import { Metadata } from "next";

import { getServerSession } from "@/lib/get-session";
import AnalyticsReport from "./analytics-report";

export const metadata: Metadata = {
  title: "Web Analytics",
};

export default async function AdminAnalyticsPage() {
  const session = await getServerSession();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  return <AnalyticsReport />;
}
