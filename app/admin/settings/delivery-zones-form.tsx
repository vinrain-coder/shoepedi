/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ISettingInput } from "@/types";
import { Plus, TrashIcon } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";

export default function DeliveryZonesForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>;
  id: string;
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const countiesArray = useFieldArray({
    control,
    name: "deliveryCounties",
  });

  const deliveryCounties = watch("deliveryCounties");

  const appendPlace = (countyIndex: number) => {
    const current = deliveryCounties[countyIndex]?.places ?? [];
    setValue(`deliveryCounties.${countyIndex}.places`, [...current, { name: "", rate: 0 }], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removePlace = (countyIndex: number, placeIndex: number) => {
    const current = deliveryCounties[countyIndex]?.places ?? [];
    if (current.length <= 1) return;
    setValue(
      `deliveryCounties.${countyIndex}.places`,
      current.filter((_, index) => index !== placeIndex),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>Delivery Locations (County & Place Rates)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {countiesArray.fields.map((countyField, countyIndex) => (
          <div key={countyField.id} className="space-y-3 rounded-lg border p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <FormField
                control={control}
                name={`deliveryCounties.${countyIndex}.county`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    {countyIndex === 0 && <FormLabel>County</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder="e.g. Nairobi" />
                    </FormControl>
                    <FormMessage>
                      {errors.deliveryCounties?.[countyIndex]?.county?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                disabled={countiesArray.fields.length === 1}
                onClick={() => countiesArray.remove(countyIndex)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {(deliveryCounties[countyIndex]?.places ?? []).map((_, placeIndex) => (
                <div
                  key={`${countyField.id}-place-${placeIndex}`}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_180px_auto]"
                >
                  <FormField
                    control={control}
                    name={`deliveryCounties.${countyIndex}.places.${placeIndex}.name`}
                    render={({ field }) => (
                      <FormItem>
                        {countyIndex === 0 && placeIndex === 0 && (
                          <FormLabel>Delivery place</FormLabel>
                        )}
                        <FormControl>
                          <Input {...field} placeholder="e.g. Westlands" />
                        </FormControl>
                        <FormMessage>
                          {
                            errors.deliveryCounties?.[countyIndex]?.places?.[
                              placeIndex
                            ]?.name?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`deliveryCounties.${countyIndex}.places.${placeIndex}.rate`}
                    render={({ field }) => (
                      <FormItem>
                        {countyIndex === 0 && placeIndex === 0 && (
                          <FormLabel>Base rate</FormLabel>
                        )}
                        <FormControl>
                          <Input {...field} type="number" min={0} placeholder="0" />
                        </FormControl>
                        <FormMessage>
                          {
                            errors.deliveryCounties?.[countyIndex]?.places?.[
                              placeIndex
                            ]?.rate?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <div>
                    {countyIndex === 0 && placeIndex === 0 && (
                      <FormLabel>Action</FormLabel>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className={countyIndex === 0 && placeIndex === 0 ? "mt-2" : ""}
                      disabled={(deliveryCounties[countyIndex]?.places?.length ?? 0) <= 1}
                      onClick={() => removePlace(countyIndex, placeIndex)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={() => appendPlace(countyIndex)}>
              <Plus className="mr-2 h-4 w-4" /> Add Place
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            countiesArray.append({
              county: "",
              places: [{ name: "", rate: 0 }],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add County
        </Button>
      </CardContent>
    </Card>
  );
}
