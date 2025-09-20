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
import { deleteUser, getAllUsers } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/db/models/user.model";
import { formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";

export const metadata: Metadata = {
  title: "Admin Users",
};

export default async function AdminUser(props: {
  searchParams: Promise<{ page: string; search?: string }>;
}) {
  // Extract search parameters
  const searchParams = await props.searchParams;
  const session = await getServerSession();

  // Ensure the user is an admin
  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || ""; // Handle search query

  // Fetch users based on page and search parameters
  const { data: users, totalPages } = await getAllUsers({
    page,
    search, // Pass the search parameter to the function
  });

  return (
    <div className="space-y-2">
      <h1 className="h1-bold">Users</h1>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: IUser) => (
              <TableRow key={user._id.toString()}>
                <TableCell>{formatId(user._id.toString())}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${user._id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user._id.toString()} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
      </div>
    </div>
  );
}
