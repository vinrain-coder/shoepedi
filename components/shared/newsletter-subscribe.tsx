"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { NewsletterSubscriptionSchema } from "@/lib/validator";
import { subscribeToNewsletter } from "@/lib/actions/newsletter.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type NewsletterFormValues = {
  email: string;
  botField?: string;
};

export default function NewsletterSubscribe() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(
      NewsletterSubscriptionSchema.pick({ email: true, botField: true })
    ),
    defaultValues: {
      email: "",
      botField: "",
    },
  });

  const onSubmit = async (values: NewsletterFormValues) => {
    const response = await subscribeToNewsletter({
      email: values.email,
      source: "footer",
      tags: ["website", "footer"],
      botField: values.botField,
    });

    if (!response.success) {
      toast.error(response.message || "Could not subscribe. Please try again.");
      return;
    }

    toast.success(response.message);
    reset();
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-[#0f1620] p-4 md:p-5">
      <h3 className="text-base font-semibold">Get insider deals in your inbox</h3>
      <p className="mt-1 text-sm text-gray-300">
        Early access to launches, exclusive coupons, and style drops.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="you@example.com"
          className="border-gray-600 bg-black/40 text-white placeholder:text-gray-400"
          {...register("email")}
        />
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("botField")}
        />

        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      <p className="mt-2 text-xs text-gray-400">
        You can unsubscribe at any time using the link in our emails.
      </p>
    </div>
  );
}
