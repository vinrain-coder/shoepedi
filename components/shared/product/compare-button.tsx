"use client";

import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/useCompareStore";
import { IProduct } from "@/lib/db/models/product.model";
import { cn } from "@/lib/utils";
import { Scale } from "lucide-react";
import { toast } from "sonner";

type CompareButtonProps = {
  product: IProduct;
  variant?: "icon" | "button";
  className?: string;
};

export default function CompareButton({
  product,
  variant = "button",
  className,
}: CompareButtonProps) {
  const { addProduct, removeProduct, isInCompare, maxItems } = useCompareStore();
  const productId = product._id.toString();
  const inCompare = isInCompare(productId);

  const toggleCompare = () => {
    if (inCompare) {
      removeProduct(productId);
      toast.success("Removed from compare");
      return;
    }

    const result = addProduct(product);

    if (result.added) {
      toast.success("Added to compare");
      return;
    }

    if (result.reason === "max") {
      toast.error(`You can compare up to ${maxItems} products`);
      return;
    }

    toast.message("Product is already in compare");
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={inCompare ? "Remove from compare" : "Add to compare"}
        title={inCompare ? "Remove from compare" : "Add to compare"}
        className={cn(
          "rounded-full bg-background p-1.5 shadow transition hover:bg-muted",
          inCompare && "bg-primary text-primary-foreground hover:bg-primary/90",
          className
        )}
        onClick={toggleCompare}
      >
        <Scale size={16} />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={inCompare ? "default" : "outline"}
      className={cn("flex items-center gap-2 w-full rounded-full", className)}
      onClick={toggleCompare}
    >
      <Scale className="h-4 w-4" />
      {inCompare ? "Remove from Compare" : "Add to Compare"}
    </Button>
  );
}
