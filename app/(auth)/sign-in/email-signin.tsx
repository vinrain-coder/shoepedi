"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

type FormData = {
  email: string;
};

export function EmailSignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { email } = data;

    await signIn("resend", { email });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-xs mb-1">
          Enter your email. We will send you a sign-in link
        </p>
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email", { required: "Email is required" })}
          className="w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full cursor-pointer">
        Get Sign-in Link
      </Button>
    </form>
  );
}
