"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUser } from "@/lib/server/actions/user.actions";
import { USER_ROLES } from "@/lib/constants";
import { IUser } from "@/lib/db/models/user.model";
import { UserUpdateSchema } from "@/lib/validator";
import { toast } from "sonner";
import SubmitButton from "@/components/shared/submit-button";

const UserEditForm = ({ user }: { user: IUser }) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: user,
  });

  async function onSubmit(values: z.infer<typeof UserUpdateSchema>) {
    try {
      const res = await updateUser({
        ...values,
        _id: user._id,
      });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }

      form.reset();
      router.push(`/admin/users`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <Form {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="rounded-lg border bg-muted/20 p-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SubmitButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full sm:w-auto"
          >
            {form.formState.isSubmitting ? "Submitting..." : `Update User `}
          </SubmitButton>

          <Button
            variant="outline"
            type="button"
            onClick={() => router.push(`/admin/users`)}
          >
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserEditForm;
