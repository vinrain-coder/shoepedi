"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PriceControl({
  initialPrice,
  onApply,
}: {
  initialPrice: string;
  onApply: (value: string) => void;
}) {
  const [range, setRange] = useState<[number, number]>(() => {
    if (!initialPrice || initialPrice === "all") return [100, 10000];
    const parts = initialPrice.split("-").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
    return [100, 10000];
  });

  const [minInput, setMinInput] = useState(range[0].toString());
  const [maxInput, setMaxInput] = useState(range[1].toString());

  useEffect(() => {
    setMinInput(range[0].toString());
    setMaxInput(range[1].toString());
  }, [range]);

  function applyPrice() {
    onApply(`${range[0]}-${range[1]}`);
  }

  return (
    <div className="space-y-3">
      <div className="px-2">
        <Slider
          value={range}
          onValueChange={(v: [number, number]) => setRange(v)}
          min={0}
          max={20000}
          step={50}
        />
      </div>
      <div className="flex gap-2">
        <Input
          value={minInput}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d]/g, "");
            setMinInput(val);
            const n = Number(val || 0);
            if (!isNaN(n) && n <= Number(maxInput || 0)) setRange([n, range[1]]);
          }}
          aria-label="Minimum price"
        />
        <Input
          value={maxInput}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d]/g, "");
            setMaxInput(val);
            const n = Number(val || 0);
            if (!isNaN(n) && n >= Number(minInput || 0)) setRange([range[0], n]);
          }}
          aria-label="Maximum price"
        />
        <Button onClick={applyPrice}>Apply</Button>
      </div>
    </div>
  );
    }
                                           
