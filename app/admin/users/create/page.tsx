import type { Metadata } from "next";
import Link from "next/link";
import UserCreateForm from "../user-create-form";

export const metadata: Metadata = {
  title: "Create User",
};

export default function CreateUserPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <div className="flex text-sm text-muted-foreground">
        <Link href="/admin/users" className="hover:underline">
          Users
        </Link>
        <span className="mx-1">›</span>
        <span>Create</span>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <h1 className="text-2xl font-semibold">Create New User</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          Add a new account and optionally assign admin access.
        </p>
        <UserCreateForm />
      </div>
    </main>
  );
}
