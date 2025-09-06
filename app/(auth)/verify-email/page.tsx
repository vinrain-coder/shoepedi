"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg rounded-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify your email
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            We’ve sent a verification link to your email address. Please check
            your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full font-semibold">
            <Link href="/sign-in">Back to Sign In</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Didn’t receive the email? Check your spam folder or request a new
            one.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
