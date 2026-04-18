"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodSectionProps {
  isPaymentMethodSelected: boolean;
  paymentMethod: string | undefined;
  isAddressSelected: boolean;
  availablePaymentMethods: { name: string; commission: number }[];
  userCoins: number;
  handleSelectPaymentMethod: () => void;
  setPaymentMethod: (method: string) => void;
  setIsPaymentMethodSelected: (selected: boolean) => void;
  setIsDeliveryDateSelected: (selected: boolean) => void;
}

export const PaymentMethodSection = ({
  isPaymentMethodSelected,
  paymentMethod,
  isAddressSelected,
  availablePaymentMethods,
  userCoins,
  handleSelectPaymentMethod,
  setPaymentMethod,
  setIsPaymentMethodSelected,
  setIsDeliveryDateSelected,
}: PaymentMethodSectionProps) => {
  if (isPaymentMethodSelected && paymentMethod) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
        <div className="flex text-lg font-bold col-span-5">
          <span className="w-8">2 </span>
          <span>Payment Method</span>
        </div>
        <div className="col-span-5">
          <p>{paymentMethod}</p>
        </div>
        <div className="col-span-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsPaymentMethodSelected(false);
              if (paymentMethod) setIsDeliveryDateSelected(true);
            }}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  if (isAddressSelected) {
    return (
      <>
        <div className="flex text-primary text-lg font-bold my-2">
          <span className="w-8">2 </span>
          <span>Choose a payment method</span>
        </div>

        <Card className="md:ml-8 my-4">
          <CardContent className="p-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value)}
            >
              {availablePaymentMethods.map((pm) => (
                <div key={pm.name} className="flex items-center py-1">
                  <RadioGroupItem
                    value={pm.name}
                    id={`payment-${pm.name}`}
                  />
                  <Label
                    className="font-bold pl-2 cursor-pointer flex items-center gap-2"
                    htmlFor={`payment-${pm.name}`}
                  >
                    {pm.name}
                    {pm.name === "Coins" && (
                      <span className="text-xs font-normal text-muted-foreground">
                        (Balance: {userCoins} coins)
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p>
                <span className="font-medium">Cash on Delivery</span> is
                only available for orders shipped within{" "}
                <span className="font-semibold">Nairobi</span>.
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-4">
            <Button
              onClick={handleSelectPaymentMethod}
              className="rounded-full font-bold cursor-pointer"
            >
              Use this payment method
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
      <span className="w-8">2 </span>
      <span>Choose a payment method</span>
    </div>
  );
};
