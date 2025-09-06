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
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg rounded-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Verified 🎉
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Your email has been verified successfully. You can now sign in to
            your account.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex justify-center">
          <Button asChild className="w-full font-semibold">
            <Link href="/">Go to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
