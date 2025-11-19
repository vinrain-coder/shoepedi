// components/search/SelectedFiltersPills.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function SelectedFiltersPills({
  selectedFilters,
  onRemove,
  onClearAll,
}: {
  selectedFilters: string[];
  onRemove: (label: string) => void;
  onClearAll?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {selectedFilters.map((f, idx) => (
        <Button
          key={idx}
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => onRemove(f)}
        >
          {f} ×
        </Button>
      ))}

      {onClearAll && (
        <Button variant="link" size="sm" onClick={onClearAll}>
          Clear All
        </Button>
      )}
    </div>
  );
}
