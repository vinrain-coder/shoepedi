"use client";

import { GoogleIcon } from "@/components/shared/google-icon";
import { LoadingButton } from "@/components/shared/loading-button";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit({ email, password, rememberMe }: SignInValues) {
    setError(null);
    setLoadingEmail(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    setLoadingEmail(false);

    if (error) {
      setError(error.message || "Something went wrong");
    } else {
      toast.success("Signed in successfully");
      router.push(redirect ?? "/");
    }
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    setError(null);
    setLoadingProvider(provider);

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: redirect ?? "/",
    });

    setLoadingProvider(null);

    if (error) {
      setError(error.message || "Something went wrong");
    } else {
      toast.success(`Signed in with ${provider}. Redirecting...`);
    }
  }

  return (
    <Card className="w-full shadow-md border rounded-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your details to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="rounded-lg border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="Password"
                      {...field}
                      className="rounded-lg border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Remember me</FormLabel>
                </FormItem>
              )}
            />

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <LoadingButton
              type="submit"
              className="w-full font-semibold"
              loading={loadingEmail}
              loadingText="Loading..."
            >
              Sign in
            </LoadingButton>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 font-medium"
                disabled={loadingProvider === "google"}
                onClick={() => handleSocialSignIn("google")}
              >
                {loadingProvider === "google" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon width="1em" height="1em" />
                    Sign in with Google
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            href={`/sign-up${redirect ? `?redirect=${redirect}` : ""}`}
            className="font-medium underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
