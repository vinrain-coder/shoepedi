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
    <div className="rounded-xl border border-white/15 bg-transparent p-4 md:p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Newsletter</h3>
      <p className="mt-1 text-sm text-gray-400">Get updates and offers.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="you@example.com"
          className="border-white/20 bg-transparent text-white placeholder:text-gray-500 sm:flex-1"
          {...register("email")}
        />
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("botField")}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      {errors.email && (
        <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
      )}
      <p className="mt-2 text-xs text-gray-400">
        You can unsubscribe at any time using the link in our emails.
      </p>
    </div>
  );
}
