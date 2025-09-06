"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { User } from "@/lib/auth";
import { useState } from "react";
import { LoadingButton } from "@/components/shared/loading-button";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  image: z.string().optional().nullable(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

interface ProfileDetailsFormProps {
  user: User;
}

export function ProfileDetailsForm({ user }: ProfileDetailsFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? null,
    },
  });

  async function onSubmit(values: UpdateProfileValues) {
    setStatus(null);
    setError(null);

    const { error } = await authClient.updateUser(values);

    if (error) {
      setError(error.message || "Failed to update profile");
    } else {
      setStatus("Profile updated");
      router.refresh();
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Later you can add an image field here if needed */}

        {error && (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        )}
        {status && (
          <div role="status" className="text-sm text-green-600">
            {status}
          </div>
        )}

        <LoadingButton
          type="submit"
          loading={loading}
          loadingText="Submitting..."
        >
          Save changes
        </LoadingButton>
      </form>
    </Form>
  );
}
