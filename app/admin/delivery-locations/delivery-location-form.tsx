"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DeliveryLocationInputSchema } from "@/lib/validator";
import { createDeliveryLocation, updateDeliveryLocation } from "@/lib/actions/delivery-location.actions";
import { Trash2, Plus } from "lucide-react";
import { z } from "zod";

type DeliveryLocationValues = z.infer<typeof DeliveryLocationInputSchema>;

const deliveryLocationDefaultValues: DeliveryLocationValues = {
  county: "",
  city: "",
  rates: [
    { deliveryDateName: "Standard", price: 0 },
  ],
};

const DeliveryLocationForm = ({
  type,
  deliveryLocation,
  deliveryLocationId,
}: {
  type: "Create" | "Update";
  deliveryLocation?: any;
  deliveryLocationId?: string;
}) => {
  const router = useRouter();

  const form = useForm<DeliveryLocationValues>({
    resolver: zodResolver(DeliveryLocationInputSchema),
    defaultValues: deliveryLocation && type === "Update" ? deliveryLocation : deliveryLocationDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rates",
  });

  async function onSubmit(values: DeliveryLocationValues) {
    if (type === "Create") {
      const res = await createDeliveryLocation(values);
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success("Delivery Location Created Successfully!");
        router.push(`/admin/delivery-locations`);
      }
    }
    if (type === "Update") {
      if (!deliveryLocationId) {
        router.push(`/admin/delivery-locations`);
        return;
      }
      const res = await updateDeliveryLocation({ ...values, _id: deliveryLocationId });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success("Delivery Location Updated Successfully!");
        router.push(`/admin/delivery-locations`);
      }
    }
  }

  return (
    <FormProvider {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="county"
            render={({ field }) => (
              <FormItem>
                <FormLabel>County</FormLabel>
                <FormControl>
                  <Input placeholder="Enter county" {...field} />
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
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Delivery Rates</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ deliveryDateName: "", price: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end border p-4 rounded-lg bg-muted/20">
              <FormField
                control={form.control}
                name={`rates.${index}.deliveryDateName`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Delivery Speed Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Standard, Express" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`rates.${index}.price`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Price (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : `${type} Delivery Location`}
        </Button>
      </form>
    </FormProvider>
  );
};

export default DeliveryLocationForm;
