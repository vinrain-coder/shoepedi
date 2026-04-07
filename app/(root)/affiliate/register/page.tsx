"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AffiliateInputSchema } from "@/lib/validator";
import { registerAffiliate } from "@/lib/actions/affiliate.actions";
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
import Breadcrumb from "@/components/shared/breadcrumb";

import { getAffiliateStatus } from "@/lib/actions/affiliate.actions";
import { Loader2 } from "lucide-react";

export default function RegisterAffiliatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const { exists } = await getAffiliateStatus();
      if (exists) {
        router.push("/affiliate/dashboard");
      } else {
        setCheckingStatus(false);
      }
    }
    checkStatus();
  }, [router]);

  const form = useForm({
    resolver: zodResolver(AffiliateInputSchema),
    defaultValues: {
      affiliateCode: "",
      paymentDetails: {
        bankName: "",
        accountName: "",
        accountNumber: "",
        payPalEmail: "",
        mPesaNumber: "",
      },
    },
  });

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    const res = await registerAffiliate(values);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      router.push("/affiliate/dashboard");
    } else {
      toast.error(res.message);
    }
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-10 space-y-4">
      <Breadcrumb />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Become an Affiliate</CardTitle>
          <p className="text-muted-foreground">
            Join our affiliate program and start earning commissions today.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="affiliateCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Affiliate Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john-deals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Payment Details</h3>
                <p className="text-sm text-muted-foreground">
                  Provide at least one payment method where you'd like to receive your earnings.
                </p>

                <FormField
                  control={form.control}
                  name="paymentDetails.mPesaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M-Pesa Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 0712345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDetails.payPalEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayPal Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g. john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/50">
                   <div className="col-span-full font-medium">Bank Details (Optional)</div>
                  <FormField
                    control={form.control}
                    name="paymentDetails.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentDetails.accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentDetails.accountNumber"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
