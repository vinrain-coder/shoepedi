"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AffiliatePayoutInputSchema } from "@/lib/validator";
import { z } from "zod";

import { createPayoutRequest } from "@/lib/actions/affiliate.actions";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LoadingButton } from "../shared/loading-button";

/* -----------------------------
   ✅ TYPE DERIVED FROM ZOD
------------------------------ */
type AffiliatePayoutInput = z.infer<typeof AffiliatePayoutInputSchema>;

export default function PayoutRequestForm({
  currentBalance,
  minAmount,
}: {
  currentBalance: number;
  minAmount: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AffiliatePayoutInput>({
    resolver: zodResolver(AffiliatePayoutInputSchema),
    defaultValues: {
      amount: minAmount,
      paymentMethod: "M-Pesa",
      paymentDetails: {
        recipient: "",
      },
    },
  });

  async function onSubmit(values: AffiliatePayoutInput) {
    // ⚠️ business rule validation (OK here)
    if (values.amount > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    const res = await createPayoutRequest(values);

    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      form.reset();
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Payout</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* AMOUNT */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Withdraw</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PAYMENT METHOD */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RECIPIENT */}
            <FormField
              control={form.control}
              name="paymentDetails.recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account/Phone Details</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone or account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUBMIT */}
            <LoadingButton
              type="submit"
              className="w-full font-semibold"
              loading={isSubmitting}
              loadingText="Requesting..."
              disabled={isSubmitting || minAmount > currentBalance}
            >
              Submit Payout Request
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
