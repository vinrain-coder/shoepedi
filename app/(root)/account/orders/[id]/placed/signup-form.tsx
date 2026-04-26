"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoadingButton } from "@/components/shared/loading-button";
import { PasswordInput } from "@/components/shared/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { passwordSchema } from "@/lib/validator";

const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, { message: "Please confirm password" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function GuestSignUpForm({
  orderId,
  accessToken,
  defaultEmail,
  defaultName,
}: {
  orderId: string;
  accessToken: string;
  defaultEmail: string;
  defaultName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: defaultName || "",
      email: defaultEmail || "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit({ email, password, name }: SignUpValues) {
    setError(null);

    const redirectPath = `/account/orders/${orderId}?accessToken=${accessToken}&linkOrder=true`;
    const encodedRedirect = encodeURIComponent(redirectPath);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
      wishlist: [] as unknown as never,
      callbackURL: `/verify-email?redirect=${encodedRedirect}`,
    });

    if (signUpError) {
      setError(signUpError.message || "Something went wrong");
    } else {
      toast.success(
        "Account created! Please verify your email to link this order.",
      );
      // We'll let the verify-email page handle the redirect,
      // but we could also store the link intent in localStorage
      localStorage.setItem(
        "link_order_after_verify",
        JSON.stringify({ orderId, accessToken }),
      );
      router.push(`/verify-email?redirect=${encodedRedirect}`);
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Card className="w-full shadow-sm border rounded-2xl mt-8">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold">Save your details</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Create an account to track this order and earn rewards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 text-left"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <LoadingButton
              type="submit"
              className="w-full font-semibold"
              loading={loading}
            >
              Create account & Save order
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
