import { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getWalletAdminStats, getWalletEarnersAdmin, WalletEarnerRow } from "@/lib/actions/wallet.actions";
import { getServerSession } from "@/lib/get-session";
import { WalletStatsCards } from "./wallet-stats-cards";
import WalletAdjustDialog from "./wallet-adjust-dialog";

export const metadata: Metadata = {
  title: "Wallet Management",
};

export default async function AdminWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const { page = "1", q = "" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [stats, earnersData] = await Promise.all([
    getWalletAdminStats(),
    getWalletEarnersAdmin({
      page: currentPage,
      search: q,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
      </div>

      <WalletStatsCards stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form method="GET">
            <Input
              name="q"
              placeholder="Search by user name or email..."
              defaultValue={q}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnersData.data.length > 0 ? (
              earnersData.data.map((user: WalletEarnerRow) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right font-mono">
                    {user.walletBalance.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <WalletAdjustDialog userId={user._id} currentBalance={user.walletBalance} />
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/wallet/${user._id}`}>History</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No users with wallet balance found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {earnersData.totalPages > 1 && (
        <Pagination page={String(currentPage)} totalPages={earnersData.totalPages} />
      )}
    </div>
  );
}
