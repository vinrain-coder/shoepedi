"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";

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

  const selected = field.value ?? [];

  const filteredColors = useMemo(
    () =>
      REACT_NATIVE_COLORS.filter((c) =>
        c.includes(search.toLowerCase())
      ),
    [search]
  );

  const toggleColor = (color: string) => {
    field.onChange(
      selected.includes(color)
        ? selected.filter((c) => c !== color)
        : [...selected, color]
    );
  };

  const removeColor = (color: string) => {
    field.onChange(selected.filter((c) => c !== color));
  };

  const clearAll = () => field.onChange([]);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      {/* Trigger */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
          >
            <span>
              {selected.length
                ? `${selected.length} color(s) selected`
                : "Select colors"}
            </span>

            {selected.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Click to edit
              </span>
            )}
          </Button>
        </PopoverTrigger>

        {/* Popover */}
        <PopoverContent className="w-[320px] p-3">
          <Input
            placeholder="Search color…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />

          <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
            {filteredColors.map((color) => {
              const isSelected = selected.includes(color);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`relative h-8 w-8 rounded-full border transition
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${isSelected ? "ring-2 ring-primary" : ""}`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {isSelected && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="mt-3 w-full text-destructive"
            >
              Clear all
            </Button>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected Preview Chips */}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((color) => (
            <div
              key={color}
              className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-background"
              title={color}
            >
              <span
                className="h-3 w-3 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <span className="max-w-[120px] truncate">
                {color}
              </span>
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <FormMessage />
    </FormItem>
  );
    }
    
