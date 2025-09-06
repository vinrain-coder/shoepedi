import { Metadata } from "next";

import OverviewReport from "./overview-report";
import { getServerSession } from "@/lib/get-session";
export const metadata: Metadata = {
  title: "Admin Dashboard",
};
const DashboardPage = async () => {
  const session = await getServerSession();
  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  return <OverviewReport />;
};

export default DashboardPage;
