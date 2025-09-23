"use client";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface SizeInputProps {
  field: {
    value: string[];
    onChange: (val: string[]) => void;
  };
  label: string;
}

const DEFAULT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  ...Array.from({ length: 11 }, (_, i) => (35 + i).toString()), // "35" to "45"
];

export default function SizeInput({ field, label }: SizeInputProps) {
  const toggleSize = (size: string) => {
    const current = field.value || [];
    if (current.includes(size)) {
      field.onChange(current.filter((s) => s !== size));
    } else {
      field.onChange([...current, size]);
    }
  };

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">{label}</FormLabel>

      <div className="flex flex-wrap gap-2">
        {DEFAULT_SIZES.map((size) => {
          const selected = field.value?.includes(size);
          return (
            <Button
              key={size}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              onClick={() => toggleSize(size)}
              className={`rounded-full px-4 ${
                selected ? "ring-2 ring-primary" : ""
              }`}
            >
              {size}
            </Button>
          );
        })}
      </div>

      <FormMessage />
    </FormItem>
  );
}
