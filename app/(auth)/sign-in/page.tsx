import type { Metadata } from "next";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <SignInForm />
    </main>
  );
}