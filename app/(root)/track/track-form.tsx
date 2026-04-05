"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const trackOrderSchema = z.object({
  trackingNumber: z
    .string()
    .min(1, "Tracking number is required")
    .trim()
    .transform((val) => val.toUpperCase()),
});

type TrackOrderValues = z.infer<typeof trackOrderSchema>;

export default function TrackOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<TrackOrderValues>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: {
      trackingNumber: "",
    },
  });

  const onSubmit = (values: TrackOrderValues) => {
    startTransition(() => {
      router.push(`/track/${encodeURIComponent(values.trackingNumber)}`);
    });
  };

  const isLoading = isPending || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="trackingNumber"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your tracking number"
                  className="h-11"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="h-11 px-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tracking...
            </>
          ) : (
            "Track order"
          )}
        </Button>
      </form>
    </Form>
  );
}
