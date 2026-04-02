"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { NewsletterSubscriptionSchema } from "@/lib/validator";
import { subscribeToNewsletter } from "@/lib/actions/newsletter.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
      <p className="mt-1 text-sm text-gray-400">
        Subscribe to get the latest updates, deals, and product drops.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="w-full">
          <Input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/30"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("botField")}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl px-4 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-3 text-xs text-gray-400">
        No spam. Unsubscribe anytime.
      </p>
    </motion.div>
  );
    }
    
