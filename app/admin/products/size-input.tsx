"use client";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SizeInputProps {
  field: any; // react-hook-form field
  label: string;
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function SizeInput({ field, label }: SizeInputProps) {
  const handleAddDefault = (size: string) => {
    if (!field.value?.includes(size)) {
      field.onChange([...(field.value || []), size]);
    }
  };

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">{label}</FormLabel>

      {/* Default size buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEFAULT_SIZES.map((size) => (
          <Button
            key={size}
            type="button"
            size="sm"
            variant={field.value?.includes(size) ? "default" : "outline"}
            onClick={() => handleAddDefault(size)}
            className="rounded-full px-4"
          >
            {size}
          </Button>
        ))}
      </div>

      {/* Custom input entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {field.value?.map((item: string, index: number) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg border p-2 shadow-sm bg-background"
          >
            <Input
              autoFocus={index === field.value.length - 1}
              className="w-full"
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const updated = field.value.filter(
                  (_: any, i: number) => i !== index
                );
                field.onChange(updated);
              }}
              className="text-red-500 hover:text-red-600"
            >
              <X size={16} />
            </Button>
          </div>
        ))}

        {/* Add new empty entry */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => field.onChange([...(field.value || []), ""])}
          className="w-full mt-1"
        >
          + Add {label.slice(0, -1)}
        </Button>
      </div>

      <FormMessage />
    </FormItem>
  );
}
