"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AffiliatePayoutInputSchema } from "@/lib/validator";
import { createPayoutRequest } from "@/lib/actions/affiliate.actions";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function PayoutRequestForm({ currentBalance, minAmount }: { currentBalance: number, minAmount: number }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(AffiliatePayoutInputSchema),
    defaultValues: {
      amount: minAmount,
      paymentMethod: "M-Pesa",
      paymentDetails: {
          recipient: ""
      },
    },
  });

  async function onSubmit(values: any) {
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

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="paymentDetails.recipient"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Account/Phone Details</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your payment details (e.g. phone or account #)" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || currentBalance < minAmount}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Submit Payout Request"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
