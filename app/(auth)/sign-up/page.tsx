import type { Metadata } from "next";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUp() {
  return (
    <main>
      <SignUpForm />
    </main>
  );
}
