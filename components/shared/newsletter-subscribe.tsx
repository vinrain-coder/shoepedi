"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { NewsletterSubscriptionSchema } from "@/lib/validator";
import { subscribeToNewsletter } from "@/lib/actions/newsletter.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Check, Mail } from "lucide-react";
import { useState } from "react"

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

  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    reset();

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
      <p className="mt-1 text-sm text-gray-400">
        Subscribe to get the latest updates and offers.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 flex items-center gap-3 relative"
      >
        {/* Input with icon */}
        <div className="relative flex-1">
          <Input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="h-12 w-full rounded-xl border-white/20 bg-white/10 pl-10 pr-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/30"
            {...register("email")}
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Hidden bot field */}
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("botField")}
        />

        {/* Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : submitted ? (
            <Check className="h-5 w-5 text-green-400" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Subscribe</span>
            </>
          )}
        </Button>
      </form>

      {/* Error */}
      {errors.email && (
        <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        No spam. Unsubscribe anytime.
      </p>
    </motion.div>
  );
    }
  
