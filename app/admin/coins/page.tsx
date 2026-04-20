import { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getServerSession } from "@/lib/get-session";
import { getCoinAdminStats, getCoinEarnersAdmin } from "@/lib/actions/coin.actions";
import { formatDateTime, formatId, formatNumber } from "@/lib/utils";
import CoinStatsCards from "./coin-stats-cards";
import CoinAdjustDialog from "./coin-adjust-dialog";

const formatCoinAmount = (value: number) => formatNumber(value);

export const metadata: Metadata = {
  title: "Admin Coins",
};

export default async function AdminCoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const { page = "1", search = "" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [coinUsersData, stats] = await Promise.all([
    getCoinEarnersAdmin({ page: currentPage, search }),
    getCoinAdminStats(),
  ]);

  const users = coinUsersData.data as Array<{
    _id: string;
    name: string;
    email: string;
    coins: number;
    createdAt?: Date;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coins Management</h1>
          <p className="text-muted-foreground">Track coin earners, inspect activity, and apply manual adjustments.</p>
        </div>
        <Form action="/admin/coins" className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="search"
            placeholder="Search by user name or email"
            defaultValue={search}
            className="pl-9"
          />
        </Form>
      </div>

      <CoinStatsCards stats={stats} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Current Coins</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatId(user._id)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCoinAmount(Number(user.coins || 0))}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.createdAt ? formatDateTime(user.createdAt).dateOnly : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/coins/${user._id}`}>View History</Link>
                      </Button>
                      <CoinAdjustDialog userId={user._id} currentCoins={Number(user.coins || 0)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No coin earners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {coinUsersData.totalPages > 1 && (
        <Pagination page={String(currentPage)} totalPages={coinUsersData.totalPages} />
      )}
    </div>
  );
}
