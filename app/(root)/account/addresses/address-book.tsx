"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AddressBookEntry, AddressBookInput } from "@/types";
import { AddressBookInputSchema } from "@/lib/validator";
import {
  removeUserAddress,
  setDefaultUserAddress,
  upsertUserAddress,
} from "@/lib/actions/address.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, PlusCircle } from "lucide-react";

const emptyAddress: AddressBookInput = {
  label: "",
  fullName: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  country: "",
  phone: "",
  saveAsDefault: false,
};

const fieldLabels: Record<
  "fullName" | "street" | "city" | "province" | "postalCode" | "country" | "phone",
  string
> = {
  fullName: "Full name",
  street: "Street address",
  city: "City",
  province: "Province / State",
  postalCode: "Postal code",
  country: "Country",
  phone: "Phone number",
};

export default function AddressBook({
  initialAddresses,
  returnTo,
}: {
  initialAddresses: AddressBookEntry[];
  returnTo?: string;
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddressBookInput>({
    resolver: zodResolver(AddressBookInputSchema),
    defaultValues: emptyAddress,
  });

  const editingAddress = useMemo(
    () => addresses.find((item) => item.id === editingAddressId),
    [addresses, editingAddressId]
  );

  const handleEdit = (address: AddressBookEntry) => {
    setEditingAddressId(address.id);
    form.reset({
      label: address.label,
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      saveAsDefault: address.isDefault,
    });
  };

  const clearForm = () => {
    setEditingAddressId(null);
    form.reset(emptyAddress);
  };

  const onSubmit = (values: AddressBookInput) => {
    startTransition(async () => {
      const result = await upsertUserAddress(values, {
        addressId: editingAddressId ?? undefined,
      });

      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to save address");
        return;
      }

      setAddresses(result.data);
      toast.success(result.message || "Address saved");

      if (returnTo) {
        const savedAddressId =
          result.data.find((item) => item.label === values.label && item.street === values.street)
            ?.id ?? result.data[0]?.id;

        router.push(
          savedAddressId
            ? `${returnTo}?selectedAddressId=${encodeURIComponent(savedAddressId)}`
            : returnTo
        );
        return;
      }

      clearForm();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2 font-medium text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Saved addresses: {addresses.length}
            </p>
            <p className="mt-1">
              Set a default address to speed up checkout and reduce typing every time.
            </p>
          </CardContent>
        </Card>
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2 text-foreground">
                <PlusCircle className="h-4 w-4 text-primary" />
                You have no saved addresses yet.
              </p>
              <p className="mt-1">Add your first address using the form to the right.</p>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card
              key={address.id}
              className={address.isDefault ? "border-primary/40 bg-primary/5" : ""}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {address.label}
                  {address.isDefault && <Badge>Default</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  {address.fullName}
                  <br />
                  {address.street}
                  <br />
                  {address.city}, {address.province} {address.postalCode}
                  <br />
                  {address.country}
                  <br />
                  {address.phone}
                </p>
                {address.isDefault && (
                  <p className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    This address is automatically preselected at checkout.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(address)}>
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await setDefaultUserAddress(address.id);
                          if (!result.success || !result.data) {
                            toast.error(result.message || "Failed to set default address");
                            return;
                          }
                          setAddresses(result.data);
                          toast.success("Default address updated");
                        })
                      }
                    >
                      Set default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await removeUserAddress(address.id);
                        if (!result.success || !result.data) {
                          toast.error(result.message || "Failed to remove address");
                          return;
                        }
                        setAddresses(result.data);
                        if (editingAddressId === address.id) clearForm();
                        toast.success("Address removed");
                      })
                    }
                  >
                    Remove
                  </Button>
                  {returnTo && (
                    <Link
                      href={`${returnTo}?selectedAddressId=${encodeURIComponent(address.id)}`}
                      className="inline-flex"
                    >
                      <Button size="sm">Use in checkout</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingAddress ? `Edit address: ${editingAddress.label}` : "Add a new address"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Office..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(
                ["fullName", "street", "city", "province", "postalCode", "country", "phone"] as const
              ).map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldLabels[fieldName]}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter ${fieldLabels[fieldName].toLowerCase()}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="saveAsDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Set as default address</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {editingAddress ? "Update address" : "Save address"}
                </Button>
                {editingAddress && (
                  <Button type="button" variant="outline" onClick={clearForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
