"use client";

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductPrice from "@/components/shared/product/product-price";
import { OrderItem } from "@/types";
import { IProduct } from "@/lib/db/models/product.model";
import QuantityController from "@/components/shared/product/quantity-controller";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CheckoutItemsProps {
  items: OrderItem[];
  products: IProduct[];
  updateItem: (item: OrderItem, quantity: number, color?: string, size?: string) => void;
  removeItem: (item: OrderItem) => void;
}

export const CheckoutItems = ({
  items,
  products,
  updateItem,
  removeItem,
}: CheckoutItemsProps) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4 py-2">
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="20vw"
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{item.name}</p>
            <p className="font-bold">
              <ProductPrice price={item.price} plain />
            </p>

            <div className="flex flex-col gap-2 my-2">
              <div className="flex flex-wrap gap-2">
                {item.color && (
                  <div className="flex items-center gap-1">
                    <div
                      style={{ backgroundColor: item.color }}
                      className="h-3 w-3 rounded-full border border-muted-foreground"
                    />
                    <Select
                      value={item.color}
                      onValueChange={(value) =>
                        updateItem(item, item.quantity, value, item.size)
                      }
                    >
                      <SelectTrigger className="w-auto cursor-pointer h-8 text-xs border-none bg-transparent p-0 focus:ring-0">
                        <SelectValue>{item.color}</SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {(() => {
                          const foundProduct = products.find(
                            (p) => p._id.toString() === item.product
                          );
                          return (foundProduct?.colors ?? []).map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  style={{ backgroundColor: color }}
                                  className="h-3 w-3 rounded-full border border-muted-foreground"
                                />
                                {color}
                              </div>
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {item.size && (
                  <Select
                    value={item.size}
                    onValueChange={(value) =>
                      updateItem(item, item.quantity, item.color, value)
                    }
                  >
                    <SelectTrigger className="w-auto cursor-pointer h-8 text-xs border-none bg-transparent p-0 focus:ring-0">
                      <SelectValue>{item.size}</SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {(() => {
                        const foundProduct = products.find(
                          (p) => p._id.toString() === item.product
                        );
                        return (foundProduct?.sizes ?? []).map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <QuantityController
                  quantity={item.quantity}
                  countInStock={item.countInStock}
                  onQuantityChange={(newQuantity) =>
                    updateItem(item, newQuantity)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item)}
                  className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
