"use client";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ColorInputProps {
  field: any; // react-hook-form field
  label: string;
}

// Default colors
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

// Helper to get name from hex
function getColorName(hex: string) {
  const found = DEFAULT_COLORS.find(
    (c) => c.hex.toLowerCase() === hex.toLowerCase()
  );
  return found ? found.name : hex; // fallback to hex if unknown
}

// Helper to get hex from name (optional)
function getHexFromName(name: string) {
  const found = DEFAULT_COLORS.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return found ? found.hex : name;
}

export default function ColorInput({ field, label }: ColorInputProps) {
  const handleAddDefault = (hex: string) => {
    if (!field.value?.includes(hex)) {
      field.onChange([...(field.value || []), hex]);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      {/* Default color swatches */}
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

      {/* Selected colors */}
      <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {field.value?.map((hex: string, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 rounded-lg p-2 border"
          >
            {/* Preview swatch + name badge */}
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full border"
                style={{ backgroundColor: hex || "#fff" }}
              />
              <Badge variant="secondary">{getColorName(hex)}</Badge>
            </div>

            {/* Input shows name instead of hex */}
            <Input
              autoFocus={index === field.value.length - 1}
              className="w-full rounded-lg"
              value={getColorName(hex)}
              placeholder={`Enter a ${label.slice(0, -1)}`}
              onChange={(e) => {
                const updated = [...field.value];
                updated[index] = getHexFromName(e.target.value); // convert name to hex
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

        {/* Add new entry */}
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
