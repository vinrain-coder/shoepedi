"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityControllerProps {
  quantity: number;
  countInStock: number;
  onQuantityChange: (newQuantity: number) => void;
  className?: string;
}

export default function QuantityController({
  quantity,
  countInStock,
  onQuantityChange,
  className,
}: QuantityControllerProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < countInStock) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleDecrease}
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleIncrease}
        disabled={quantity >= countInStock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
