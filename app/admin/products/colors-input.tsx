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

// Predefined colors
const DEFAULT_COLORS: { hex: string; name: string }[] = [
  { hex: "#000000", name: "Black" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#FF0000", name: "Red" },
  { hex: "#00FF00", name: "Green" },
  { hex: "#0000FF", name: "Blue" },
  { hex: "#FFFF00", name: "Yellow" },
  { hex: "#FFA500", name: "Orange" },
  { hex: "#800080", name: "Purple" },
  { hex: "#808080", name: "Gray" },
];

export default function ColorInput({ field, label }: ColorInputProps) {
  const toggleColor = (hex: string) => {
    const current = field.value || [];
    if (current.includes(hex)) {
      // Remove if already selected
      field.onChange(current.filter((c) => c !== hex));
    } else {
      // Add if not selected
      field.onChange([...current, hex]);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_COLORS.map(({ hex, name }) => {
          const selected = field.value?.includes(hex);
          return (
            <Button
              key={hex}
              type="button"
              onClick={() => toggleColor(hex)}
              variant={selected ? "default" : "outline"}
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
