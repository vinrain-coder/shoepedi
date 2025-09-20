import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <main className="flex h-screen w-screen bg-muted">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <AdminNav />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
