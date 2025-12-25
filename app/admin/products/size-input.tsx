"use client";

import * as React from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeInputProps {
  field: {
    value: string[] | undefined;
    onChange: (val: string[]) => void;
  };
  label: string;
  sizes?: string[]; // Flexibility: allow custom size lists
}

const DEFAULT_SIZES = [
  "XS", "S", "M", "L", "XL",
  ...Array.from({ length: 19 }, (_, i) => (27 + i).toString()),
];

export default function SizeInput({ 
  field, 
  label, 
  sizes = DEFAULT_SIZES 
}: SizeInputProps) {
  // Use a Set for performance (O(1) lookups)
  const selectedSet = React.useMemo(() => new Set(field.value || []), [field.value]);

  const toggleSize = React.useCallback((size: string) => {
    const newSet = new Set(selectedSet);
    if (newSet.has(size)) {
      newSet.delete(size);
    } else {
      newSet.add(size);
    }
    field.onChange(Array.from(newSet));
  }, [selectedSet, field]);

  const clearAll = () => field.onChange([]);

  return (
    <FormItem className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-semibold">{label}</FormLabel>
        {selectedSet.size > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      <div 
        className="flex flex-wrap gap-2" 
        role="group" 
        aria-label={`Select ${label}`}
      >
        {sizes.map((size) => {
          const isSelected = selectedSet.has(size);
          return (
            <Button
              key={size}
              type="button"
              size="sm"
              variant={isSelected ? "default" : "outline"}
              aria-pressed={isSelected}
              onClick={() => toggleSize(size)}
              className={cn(
                "min-w-[45px] transition-all active:scale-95 rounded-full",
                isSelected ? "shadow-sm" : "text-muted-foreground"
              )}
            >
              {size}
            </Button>
          );
        })}
      </div>

      {selectedSet.size > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.from(selectedSet).map((s) => (
            <Badge key={s} variant="secondary" className="rounded-full text-[10px] py-0 px-2">
              {s}
            </Badge>
          ))}
        </div>
      )}

      <FormMessage />
    </FormItem>
  );
  }
