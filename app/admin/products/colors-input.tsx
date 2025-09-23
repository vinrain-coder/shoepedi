"use client";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface ColorInputProps {
  field: {
    value: string[];
    onChange: (val: string[]) => void;
  };
  label: string;
}

// Predefined colors (name first, hex only for UI)
const DEFAULT_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Purple", hex: "#800080" },
  { name: "Gray", hex: "#808080" },
];

export default function ColorInput({ field, label }: ColorInputProps) {
  const toggleColor = (name: string) => {
    const current = field.value || [];
    if (current.includes(name)) {
      field.onChange(current.filter((c) => c !== name));
    } else {
      field.onChange([...current, name]);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_COLORS.map(({ name, hex }) => {
          const selected = field.value?.includes(name);
          return (
            <Button
              key={name}
              type="button"
              onClick={() => toggleColor(name)}
              variant="outline"
              className={`h-10 px-3 rounded-full flex items-center gap-2 ${
                selected ? "ring-2 ring-primary" : ""
              }`}
            >
              <span
                className="inline-block h-5 w-5 rounded-full border"
                style={{ backgroundColor: hex }}
              />
              {name}
            </Button>
          );
        })}
      </div>
      <FormMessage />
    </FormItem>
  );
}
