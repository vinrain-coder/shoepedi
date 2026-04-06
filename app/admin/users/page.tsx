import { Metadata } from "next";
import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteUser, getAllUsers, getUserStats } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/db/models/user.model";
import { formatDateTime, formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import UserStatsCards from "./user-stats-cards";
import { Badge } from "@/components/ui/badge";
import { Search, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";

export const metadata: Metadata = {
  title: "Admin Users",
};

export default async function AdminUserPage(props: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession();

  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const search = searchParams.search || "";
  const role = searchParams.role || "all";

  const [data, stats] = await Promise.all([
    getAllUsers({
      page,
      search,
      role,
    }),
    getUserStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Users</h1>
          <p className="text-muted-foreground">
            Manage customer accounts, roles, and administrative access
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/users" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search users..."
              defaultValue={search}
              className="pl-9"
            />
            {role !== "all" && <input type="hidden" name="role" value={role} />}
          </Form>
        </div>
      </div>

      <UserStatsCards stats={stats} currentRole={role} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length > 0 ? (
              data.data.map((user: IUser) => (
                <TableRow key={user._id.toString()}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(user._id.toString())}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="size-4 text-primary" />
                       </div>
                       <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.createdAt ? formatDateTime(user.createdAt).dateOnly : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/users/${user._id}`}>Edit</Link>
                      </Button>
                      <DeleteDialog id={user._id.toString()} action={deleteUser} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}
