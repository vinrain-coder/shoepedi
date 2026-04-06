"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { ISettingInput } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AffiliateSettingForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>;
  id?: string;
}) {
  return (
    <div id={id}>
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="affiliate.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Enable Affiliate Program</FormLabel>
                <FormDescription>
                  Allow users to register and earn commissions.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="affiliate.commissionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Commission Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <p className="text-[0.8rem] text-muted-foreground">
                  Global percentage earned by affiliates on the net items price (after coupon discounts).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="affiliate.cookieExpiryDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cookie Expiry (Days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="affiliate.minWithdrawalAmount"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Minimum Withdrawal Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} />
                </FormControl>
                <p className="text-[0.8rem] text-muted-foreground">
                  The minimum balance required for an affiliate to request a payout.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
    </div>
  );
}