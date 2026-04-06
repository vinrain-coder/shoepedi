"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createDeliveryLocation, updateDeliveryLocation, SerializedDeliveryLocation } from "@/lib/actions/delivery-location.actions";
import { DeliveryLocationInputSchema, DeliveryLocationUpdateSchema } from "@/lib/validator";
import { toast } from "sonner";
import SubmitButton from "@/components/shared/submit-button";

const deliveryLocationDefaultValues = {
  county: "",
  city: "",
  rate: 0,
};

const DeliveryLocationForm = ({
  type,
  deliveryLocation,
  deliveryLocationId,
}: {
  type: "Create" | "Update";
  deliveryLocation?: SerializedDeliveryLocation;
  deliveryLocationId?: string;
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof DeliveryLocationInputSchema>>({
    resolver: zodResolver(
      type === "Update" ? DeliveryLocationUpdateSchema : DeliveryLocationInputSchema
    ),
    defaultValues: deliveryLocation && type === "Update" ? deliveryLocation : deliveryLocationDefaultValues,
  });

  async function onSubmit(values: z.infer<typeof DeliveryLocationInputSchema>) {
    let res;
    if (type === "Create") {
      res = await createDeliveryLocation(values);
    } else {
      if (!deliveryLocationId) {
        router.push(`/admin/delivery-locations`);
        return;
      }
      res = await updateDeliveryLocation({ ...values, _id: deliveryLocationId });
    }

    if (res.success) {
      toast.success(res.message);
      router.push(`/admin/delivery-locations`);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">
        <FormField
          control={form.control}
          name="county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>County</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Nairobi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City / Place</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Westlands" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Delivery Rate</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          isLoading={form.formState.isSubmitting}
          loadingText="Submitting..."
          size="lg"
        >
          {type} Location
        </SubmitButton>
      </form>
    </Form>
  );
};

export default DeliveryLocationForm;
