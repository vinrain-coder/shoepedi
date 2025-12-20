"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { REACT_NATIVE_COLORS } from "@/lib/constants";

interface ColorInputProps {
  field: {
    value: string[];
    onChange: (val: string[]) => void;
  };
  label: string;
}

export default function ColorInput({ field, label }: ColorInputProps) {
  const [search, setSearch] = useState("");

  const filteredColors = useMemo(() => {
    return REACT_NATIVE_COLORS.filter((c) =>
      c.includes(search.toLowerCase())
    );
  }, [search]);

  const toggleColor = (color: string) => {
    const current = field.value ?? [];
    field.onChange(
      current.includes(color)
        ? current.filter((c) => c !== color)
        : [...current, color]
    );
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
          >
            {field.value?.length
              ? `${field.value.length} color(s) selected`
              : "Select colors"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px] p-3">
          <Input
            placeholder="Search color…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />

          <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
            {filteredColors.map((color) => {
              const selected = field.value?.includes(color);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`relative h-8 w-8 rounded-full border transition
                    ${selected ? "ring-2 ring-primary" : ""}`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {selected && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
      }
