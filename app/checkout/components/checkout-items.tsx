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

            <div className="flex flex-wrap gap-2 my-2">
              <Select
                value={item.color}
                onValueChange={(value) =>
                  updateItem(item, item.quantity, value, item.size)
                }
              >
                <SelectTrigger className="w-auto cursor-pointer h-8 text-xs">
                  <SelectValue>{item.color}</SelectValue>
                </SelectTrigger>
                <SelectContent position="popper">
                  {(() => {
                    const foundProduct = products.find(
                      (p) => p._id.toString() === item.product
                    );
                    return (foundProduct?.colors ?? []).map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>

              <Select
                value={item.size}
                onValueChange={(value) =>
                  updateItem(item, item.quantity, item.color, value)
                }
              >
                <SelectTrigger className="w-auto cursor-pointer h-8 text-xs">
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

              <Select
                value={item.quantity.toString()}
                onValueChange={(value) => {
                  if (value === "0") removeItem(item);
                  else updateItem(item, Number(value));
                }}
              >
                <SelectTrigger className="w-24 cursor-pointer h-8 text-xs">
                  <SelectValue>Qty: {item.quantity}</SelectValue>
                </SelectTrigger>
                <SelectContent position="popper">
                  {Array.from({ length: item.countInStock }).map((_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      {i + 1}
                    </SelectItem>
                  ))}
                  <SelectItem key="delete" value="0">
                    Delete
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
