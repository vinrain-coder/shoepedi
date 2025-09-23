"use client";

import { useState } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColorSizeInputProps {
  field: any; // react-hook-form field
  label: string;
  defaultOptions?: string[]; // optional preset sizes or colors
}

export default function ColorSizeInput({
  field,
  label,
  defaultOptions = [],
}: ColorSizeInputProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleAddDefault = (option: string) => {
    if (!field.value?.includes(option)) {
      field.onChange([...(field.value || []), option]);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      {/* Default options as quick-add buttons */}
      {defaultOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {defaultOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAddDefault(option)}
              className={`px-3 py-1 rounded-full border ${
                field.value?.includes(option)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Custom input entries */}
      <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {field.value?.map((item: string, index: number) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg p-2 border"
          >
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
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => {
                const updated = field.value.filter(
                  (_: any, i: number) => i !== index
                );
                field.onChange(updated);
              }}
            >
              <X size={16} />
            </button>
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
