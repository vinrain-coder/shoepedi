"use client";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // shadcn badge for clean labels

interface ColorInputProps {
  field: any; // react-hook-form field
  label: string;
}

// Define default colors with names
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

// Helper: find readable name for a color hex
function getColorName(hex: string) {
  const found = DEFAULT_COLORS.find(
    (c) => c.hex.toLowerCase() === hex.toLowerCase()
  );
  return found ? found.name : hex; // fallback: show hex if not in list
}

export default function ColorInput({ field, label }: ColorInputProps) {
  const handleAddDefault = (color: string) => {
    if (!field.value?.includes(color)) {
      field.onChange([...(field.value || []), color]);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      

      {/* Default colors as swatches */}
      <div className="flex flex-wrap gap-2 mb-2">
        {DEFAULT_COLORS.map(({ hex, name }) => (
          <Button
            key={hex}
            variant="outline"
            type="button"
            onClick={() => handleAddDefault(hex)}
            className={`h-8 px-3 rounded-full border text-xs ${
              field.value?.includes(hex) ? "ring-2 ring-primary" : ""
            }`}
          >
            <span
              className="inline-block h-4 w-4 rounded-full border mr-2"
              style={{ backgroundColor: hex }}
            />
            {name}
          </Button>
        ))}
      </div>

      {/* Custom input entries */}
      <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {field.value?.map((item: string, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 rounded-lg p-2 border"
          >
            {/* Preview swatch + label */}
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full border"
                style={{ backgroundColor: item || "#fff" }}
              />
              <Badge variant="secondary">{getColorName(item)}</Badge>
            </div>

            {/* Input to allow custom colors */}
            <Input
              autoFocus={index === field.value.length - 1}
              className="w-full rounded-lg"
              value={item}
              placeholder={`Enter a ${label.toLowerCase()}`}
              onChange={(e) => {
                const updated = [...field.value];
                updated[index] = e.target.value;
                field.onChange(updated);
              }}
              onKeyDown={(e: { key: string; preventDefault: () => void }) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />

            {/* Remove button */}
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={() => {
                const updated = field.value.filter(
                  (_: any, i: number) => i !== index
                );
                field.onChange(updated);
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ))}

        {/* Add new empty entry */}
        <Button
          type="button"
          variant="outline"
          onClick={() => field.onChange([...(field.value || []), ""])}
          className="mt-2 w-full"
        >
          Add {label.slice(0, -1)}
        </Button>
      </div>

      <FormMessage />
    </FormItem>
  );
}
