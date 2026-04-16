import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductPrice from "@/components/shared/product/product-price";
import { calculateFutureDate, formatDateTime, timeUntilMidnight } from "@/lib/utils";
import { calculateShippingPrice } from "@/lib/delivery";

type CartItem = {
  clientId?: string;
  slug?: string;
  category?: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  color?: string;
  size?: string;
  product: string;
  countInStock: number;
};

type ProductOption = { _id: { toString(): string }; colors?: string[]; sizes?: string[] };

type DeliveryDateOption = {
  name: string;
  daysToDeliver: number;
  shippingPrice: number;
  freeShippingMinPrice: number;
};

export function CheckoutItemsShippingSection({
  isDeliveryDateSelected,
  deliveryDateIndex,
  selectedDeliveryDate,
  isPaymentMethodSelected,
  isAddressSelected,
  items,
  products,
  updateItem,
  removeItem,
  availableDeliveryDates,
  setDeliveryDateIndex,
  discountAmount,
  selectedPlace,
  places,
  itemsPrice,
  setIsPaymentMethodSelected,
  setIsDeliveryDateSelected,
}: {
  isDeliveryDateSelected: boolean;
  deliveryDateIndex?: number;
  selectedDeliveryDate: DeliveryDateOption;
  isPaymentMethodSelected: boolean;
  isAddressSelected: boolean;
  items: CartItem[];
  products: ProductOption[];
  updateItem: (...args: any[]) => void | Promise<void>;
  removeItem: (...args: any[]) => void | Promise<void>;
  availableDeliveryDates: DeliveryDateOption[];
  setDeliveryDateIndex: (index: number, discount?: number) => void;
  discountAmount: number;
  selectedPlace?: string;
  places: { city: string; rate: number }[];
  itemsPrice: number;
  setIsPaymentMethodSelected: (value: boolean) => void;
  setIsDeliveryDateSelected: (value: boolean) => void;
}) {
  if (isDeliveryDateSelected && deliveryDateIndex !== undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
        <div className="flex text-lg font-bold col-span-5"><span className="w-8">3 </span><span>Items and shipping</span></div>
        <div className="col-span-5">
          <p>Delivery date: {formatDateTime(calculateFutureDate(selectedDeliveryDate.daysToDeliver)).dateOnly}</p>
          <ul>{items.map((item, i) => <li key={i}>{item.name} x {item.quantity} = {item.price}</li>)}</ul>
        </div>
        <div className="col-span-2"><Button variant="outline" onClick={() => { setIsPaymentMethodSelected(true); setIsDeliveryDateSelected(false); }}>Change</Button></div>
      </div>
    );
  }

  if (!(isPaymentMethodSelected && isAddressSelected)) {
    return <div className="flex text-muted-foreground text-lg font-bold my-4 py-3"><span className="w-8">3 </span><span>Items and shipping</span></div>;
  }

  return (
    <>
      <div className="flex text-primary text-lg font-bold my-2"><span className="w-8">3 </span><span>Review items and shipping</span></div>
      <Card className="md:ml-8">
        <CardContent className="p-4">
          <p className="mb-2"><span className="text-lg font-bold text-green-700">Arriving {formatDateTime(calculateFutureDate(selectedDeliveryDate.daysToDeliver)).dateOnly}</span> If you order in the next {timeUntilMidnight().hours} hours and {timeUntilMidnight().minutes} minutes.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 py-2">
                  <div className="relative w-16 h-16"><Image src={item.image} alt={item.name} fill sizes="20vw" style={{ objectFit: "contain" }} /></div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="font-bold"><ProductPrice price={item.price} plain /></p>
                    <div className="flex flex-wrap gap-2 my-2">
                      <Select value={item.color} onValueChange={(value) => updateItem(item, item.quantity, value, item.size)}>
                        <SelectTrigger className="w-auto cursor-pointer"><SelectValue>{item.color}</SelectValue></SelectTrigger>
                        <SelectContent position="popper">{(products.find((p) => p._id.toString() === item.product)?.colors ?? []).map((color) => <SelectItem key={color} value={color}>{color}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={item.size} onValueChange={(value) => updateItem(item, item.quantity, item.color, value)}>
                        <SelectTrigger className="w-auto cursor-pointer"><SelectValue>{item.size}</SelectValue></SelectTrigger>
                        <SelectContent position="popper">{(products.find((p) => p._id.toString() === item.product)?.sizes ?? []).map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={item.quantity.toString()} onValueChange={(value) => { if (value === "0") removeItem(item); else updateItem(item, Number(value)); }}>
                        <SelectTrigger className="w-24 cursor-pointer"><SelectValue>Qty: {item.quantity}</SelectValue></SelectTrigger>
                        <SelectContent position="popper">{Array.from({ length: item.countInStock }).map((_, i) => <SelectItem key={i + 1} value={`${i + 1}`}>{i + 1}</SelectItem>)}<SelectItem key="delete" value="0">Delete</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 font-bold">Choose a shipping speed:</p>
              <ul>
                <RadioGroup value={selectedDeliveryDate.name} onValueChange={(value) => setDeliveryDateIndex(availableDeliveryDates.findIndex((d) => d.name === value), discountAmount)}>
                  {availableDeliveryDates.map((dd) => (
                    <div key={dd.name} className="flex">
                      <RadioGroupItem className="cursor-pointer" value={dd.name} id={`address-${dd.name}`} />
                      <Label className="pl-2 space-y-2 cursor-pointer" htmlFor={`address-${dd.name}`}>
                        <div className="text-green-700 font-semibold">{formatDateTime(calculateFutureDate(dd.daysToDeliver)).dateOnly}</div>
                        <div>
                          {(() => {
                            const placeRecord = places.find((p) => p.city === selectedPlace);
                            const locationRate = placeRecord?.rate ?? 0;
                            const totalPrice = calculateShippingPrice({ deliveryDate: dd, itemsPrice, shippingRate: locationRate }) ?? 0;
                            if (totalPrice === 0) return "FREE Shipping";
                            return <div className="flex flex-col"><span className="font-bold"><ProductPrice price={totalPrice} plain /></span>{locationRate > 0 && <span className="text-[10px] text-muted-foreground font-normal">(Speed: <ProductPrice price={dd.shippingPrice} plain /> + Location: <ProductPrice price={locationRate} plain />)</span>}</div>;
                          })()}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
