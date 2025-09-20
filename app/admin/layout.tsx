import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./overview/dashboard-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <main className="flex flex-col h-screen w-screen bg-muted">
        <DashboardSidebar />
        {children}
      </main>
    </SidebarProvider>
  );
}
