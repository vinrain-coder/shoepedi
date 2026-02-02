"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrder } from "@/lib/actions/order.actions";
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from "@/lib/utils";
import { ShippingAddressSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CheckoutFooter from "./checkout-footer";
import { ShippingAddress } from "@/types";
import useIsMounted from "@/hooks/use-is-mounted";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import ProductPrice from "@/components/shared/product/product-price";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import dynamic from "next/dynamic";
import { IOrder } from "@/lib/db/models/order.model";
import { AlertCircle } from "lucide-react";
import { validateCoupon } from "@/lib/actions/coupon.actions";

const PaystackInline = dynamic(
  () => import("./paystack-inline"),
  { ssr: false } // <-- only render on the client
);

const shippingAddressDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
        fullName: "Basir",
        street: "1911, 65 Sherbrooke Est",
        city: "Montreal",
        province: "Quebec",
        phone: "4181234567",
        postalCode: "H2X 1C4",
        country: "Canada",
      }
    : {
        fullName: "",
        street: "",
        city: "",
        province: "",
        phone: "",
        postalCode: "",
        country: "",
      };

const CheckoutForm = () => {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const handleApplyCoupon = async () => {
    try {
      const result = await validateCoupon(couponCode, totalPrice);
      setDiscountAmount(result.discount);
      toast.success("Coupon applied successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const {
    setting: {
      site,
      availablePaymentMethods,
      defaultPaymentMethod,
      availableDeliveryDates,
    },
  } = useSettingStore();

  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      
      totalPrice,
      shippingAddress,
      deliveryDateIndex,
      paymentMethod = defaultPaymentMethod,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    clearCart,
    setDeliveryDateIndex,
  } = useCartStore();
  const isMounted = useIsMounted();

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  });
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    setShippingAddress(values);
    setIsAddressSelected(true);
  };

  useEffect(() => {
    if (!isMounted || !shippingAddress) return;
    shippingAddressForm.setValue("fullName", shippingAddress.fullName);
    shippingAddressForm.setValue("street", shippingAddress.street);
    shippingAddressForm.setValue("city", shippingAddress.city);
    shippingAddressForm.setValue("country", shippingAddress.country);
    shippingAddressForm.setValue("postalCode", shippingAddress.postalCode);
    shippingAddressForm.setValue("province", shippingAddress.province);
    shippingAddressForm.setValue("phone", shippingAddress.phone);
  }, [items, isMounted, router, shippingAddress, shippingAddressForm]);

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false);
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] =
    useState<boolean>(false);

  const handlePlaceOrder = async () => {
    try {
      // Create the order on the server
      const res = await createOrder({
        items,
        shippingAddress,
        expectedDeliveryDate: calculateFutureDate(
          availableDeliveryDates[deliveryDateIndex!].daysToDeliver
        ),
        deliveryDateIndex,
        paymentMethod,
        itemsPrice, 
        shippingPrice,
        taxPrice,
        totalPrice,
      });

      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to create order");
        return;
      }

      if (createdOrder) {
        toast.error("This order is already created. Proceed to payment.");
        return;
      }

      const order = res.data as IOrder; // Ensure this is the full order object
      toast.success("Order created!");

      clearCart();

      if (paymentMethod === "Cash On Delivery") {
        // Redirect immediately for COD
        router.push(`/account/orders/${order._id}`);
        return;
      }

      // For online payment (Paystack), store order to render Paystack button
      setCreatedOrder(order);
      toast.success("Proceed to payment.");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true);
    setIsPaymentMethodSelected(true);
  };
  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)();
  };
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const CheckoutSummary = ({
    createdOrder,
    paymentMethod,
    handlePlaceOrder,
  }: {
    createdOrder: IOrder | null;
    paymentMethod: string;
    handlePlaceOrder: () => void;
  }) => (
    <Card>
      <CardContent className="p-4">
        {!isAddressSelected && (
          <div className="border-b mb-4">
            <Button
              className="rounded-full w-full cursor-pointer"
              onClick={handleSelectShippingAddress}
            >
              Ship to this address
            </Button>
            <p className="text-xs text-center py-2">
              Choose a shipping address and payment method in order to calculate
              shipping, handling, and tax.
            </p>
          </div>
        )}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className=" mb-4">
            <Button
              className="rounded-full w-full cursor-pointer"
              onClick={handleSelectPaymentMethod}
            >
              Use this payment method
            </Button>

            <p className="text-xs text-center py-2">
              Choose a payment method to continue checking out. You&apos;ll
              still have a chance to review and edit your order before it&apos;s
              final.
            </p>
          </div>
        )}

        <div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
              />
              <Button onClick={handleApplyCoupon}>Apply</Button>
            </div>
            {discountAmount > 0 && (
              <p className="mt-1">
                Coupon applied — you saved{" "}
                <span className="text-green-600">
                  <ProductPrice price={discountAmount} plain />
                </span>
              </p>
            )}
            <div className="text-lg font-bold">Order Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>
                  <ProductPrice price={itemsPrice} plain />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Handling:</span>
                <span>
                  {shippingPrice === undefined ? (
                    "--"
                  ) : shippingPrice === 0 ? (
                    "FREE"
                  ) : (
                    <span>
                      <ProductPrice price={shippingPrice} plain />
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span> Tax:</span>
                <span>
                  {taxPrice === undefined ? (
                    "--"
                  ) : (
                    <span>
                      <ProductPrice price={taxPrice} plain />
                    </span>
                  )}
                </span>
              </div>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Coupon Discount:</span>
                <span>
                  -<ProductPrice price={discountAmount} plain />
                </span>
              </div>
            )}

            <div className="flex justify-between  pt-4 font-bold text-lg">
              <span> Order Total:</span>
              <span>
                <ProductPrice
                  price={Math.max(0, totalPrice - discountAmount)}
                  plain
                />
              </span>
            </div>
          </div>
        </div>
        <div>
          <Button
            onClick={handlePlaceOrder}
            className="rounded-full w-full cursor-pointer"
            hidden={
              paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" &&
              !!createdOrder
            }
          >
            Place Your Order
          </Button>
          <p className="text-xs text-center py-2">
            By placing your order, you agree to {site.name}&apos;s{" "}
            <Link href="/page/privacy-policy">privacy notice</Link> and
            <Link href="/page/conditions-of-use"> conditions of use</Link>.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const { data: session } = authClient.useSession();
  return (
    <main className="max-w-6xl mx-auto highlight-link">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* shipping address */}
          <div>
            {isAddressSelected && shippingAddress ? (
              <div className="grid grid-cols-1 md:grid-cols-12    my-3  pb-3">
                <div className="col-span-5 flex text-lg font-bold ">
                  <span className="w-8">1 </span>
                  <span>Shipping address</span>
                </div>
                <div className="col-span-5 ">
                  <p>
                    {shippingAddress.fullName} <br />
                    {shippingAddress.street} <br />
                    {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                  </p>
                </div>
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsAddressSelected(false);
                      setIsPaymentMethodSelected(true);
                      setIsDeliveryDateSelected(true);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">1 </span>
                  <span>Enter shipping address</span>
                </div>
                <Form {...shippingAddressForm}>
                  <form
                    method="post"
                    onSubmit={shippingAddressForm.handleSubmit(
                      onSubmitShippingAddress
                    )}
                    className="space-y-4"
                  >
                    <Card className="md:ml-8 my-4">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-lg font-bold mb-2">
                          Your address
                        </div>

                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter address"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter province"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter country"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter postal code"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter phone number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="  p-4">
                        <Button
                          type="submit"
                          className="rounded-full font-bold cursor-pointer"
                        >
                          Ship to this address
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>
          {/* payment method */}
          <div className="border-y">
            {isPaymentMethodSelected && paymentMethod ? (
              <div className="grid  grid-cols-1 md:grid-cols-12  my-3 pb-3">
                <div className="flex text-lg font-bold  col-span-5">
                  <span className="w-8">2 </span>
                  <span>Payment Method</span>
                </div>
                <div className="col-span-5 ">
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
            ) : isAddressSelected ? (
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
                        <div key={pm.name} className="flex items-center py-1 ">
                          <RadioGroupItem
                            value={pm.name}
                            id={`payment-${pm.name}`}
                          />
                          <Label
                            className="font-bold pl-2 cursor-pointer"
                            htmlFor={`payment-${pm.name}`}
                          >
                            {pm.name}
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
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">2 </span>
                <span>Choose a payment method</span>
              </div>
            )}
          </div>
          {/* items and delivery date */}
          <div>
            {isDeliveryDateSelected && deliveryDateIndex != undefined ? (
              <div className="grid  grid-cols-1 md:grid-cols-12  my-3 pb-3">
                <div className="flex text-lg font-bold  col-span-5">
                  <span className="w-8">3 </span>
                  <span>Items and shipping</span>
                </div>
                <div className="col-span-5">
                  <p>
                    Delivery date:{" "}
                    {
                      formatDateTime(
                        calculateFutureDate(
                          availableDeliveryDates[deliveryDateIndex]
                            .daysToDeliver
                        )
                      ).dateOnly
                    }
                  </p>
                  <ul>
                    {items.map((item, _index) => (
                      <li key={_index}>
                        {item.name} x {item.quantity} = {item.price}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsPaymentMethodSelected(true);
                      setIsDeliveryDateSelected(false);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              <>
                <div className="flex text-primary  text-lg font-bold my-2">
                  <span className="w-8">3 </span>
                  <span>Review items and shipping</span>
                </div>
                <Card className="md:ml-8">
                  <CardContent className="p-4">
                    <p className="mb-2">
                      <span className="text-lg font-bold text-green-700">
                        Arriving{" "}
                        {
                          formatDateTime(
                            calculateFutureDate(
                              availableDeliveryDates[deliveryDateIndex!]
                                .daysToDeliver
                            )
                          ).dateOnly
                        }
                      </span>{" "}
                      If you order in the next {timeUntilMidnight().hours} hours
                      and {timeUntilMidnight().minutes} minutes.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        {items.map((item, _index) => (
                          <div key={_index} className="flex gap-4 py-2">
                            <div className="relative w-16 h-16">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="20vw"
                                style={{
                                  objectFit: "contain",
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold">
                                {item.name}, {item.color}, {item.size}
                              </p>
                              <p className="font-bold">
                                <ProductPrice price={item.price} plain />
                              </p>

                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => {
                                  if (value === "0") removeItem(item);
                                  else updateItem(item, Number(value));
                                }}
                              >
                                <SelectTrigger className="w-24 cursor-pointer">
                                  <SelectValue>
                                    Qty: {item.quantity}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {Array.from({
                                    length: item.countInStock,
                                  }).map((_, i) => (
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
                        ))}
                      </div>
                      <div>
                        <div className=" font-bold">
                          <p className="mb-2"> Choose a shipping speed:</p>

                          <ul>
                            <RadioGroup
                              value={
                                availableDeliveryDates[deliveryDateIndex!].name
                              }
                              onValueChange={(value) =>
                                setDeliveryDateIndex(
                                  availableDeliveryDates.findIndex(
                                    (address) => address.name === value
                                  )!
                                )
                              }
                            >
                              {availableDeliveryDates.map((dd) => (
                                <div key={dd.name} className="flex">
                                  <RadioGroupItem
                                    className="cursor-pointer"
                                    value={dd.name}
                                    id={`address-${dd.name}`}
                                  />
                                  <Label
                                    className="pl-2 space-y-2 cursor-pointer"
                                    htmlFor={`address-${dd.name}`}
                                  >
                                    <div className="text-green-700 font-semibold">
                                      {
                                        formatDateTime(
                                          calculateFutureDate(dd.daysToDeliver)
                                        ).dateOnly
                                      }
                                    </div>
                                    <div>
                                      {(dd.freeShippingMinPrice > 0 &&
                                      itemsPrice >= dd.freeShippingMinPrice
                                        ? 0
                                        : dd.shippingPrice) === 0 ? (
                                        "FREE Shipping"
                                      ) : (
                                        <span>
                                          <ProductPrice
                                            price={dd.shippingPrice}
                                            plain
                                          />
                                        </span>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">3 </span>
                <span>Items and shipping</span>
              </div>
            )}
          </div>
          {isPaymentMethodSelected && isAddressSelected && (
            <div className="mt-6">
              {/* Mobile summary */}
              <div className="block md:hidden">
                <CheckoutSummary
                  createdOrder={createdOrder}
                  paymentMethod={paymentMethod}
                  handlePlaceOrder={handlePlaceOrder}
                />
                {paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" &&
                  createdOrder && (
                    <PaystackInline
                      email={session?.user.email as string}
                      amount={Math.round((totalPrice - discountAmount) * 100)}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                      orderId={createdOrder._id}
                      onSuccess={() =>
                        router.push(`/account/orders/${createdOrder._id}`)
                      }
                      onFailure={() =>
                        router.push(`/account/orders/${createdOrder._id}`)
                      }
                    />
                  )}
              </div>

              <Card className="hidden md:block ">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                  {paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" &&
                  createdOrder ? (
                    <PaystackInline
                      email={session?.user.email as string}
                      amount={Math.round((totalPrice - discountAmount) * 100)}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                      orderId={createdOrder._id}
                      onSuccess={() =>
                        router.push(`/account/orders/${createdOrder._id}`)
                      }
                      onFailure={() =>
                        router.push(`/account/orders/${createdOrder._id}`)
                      }
                    />
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      className="rounded-full cursor-pointer"
                      hidden={
                        paymentMethod ===
                          "Mobile Money (M-Pesa / Airtel) & Card" &&
                        !!createdOrder
                      }
                    >
                      Place Your Order
                    </Button>
                  )}

                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      Order Total: <ProductPrice price={totalPrice} plain />
                    </p>
                    <p className="text-xs">
                      {" "}
                      By placing your order, you agree to {
                        site.name
                      }&apos;s{" "}
                      <Link href="/page/privacy-policy">privacy notice</Link>{" "}
                      and
                      <Link href="/page/conditions-of-use">
                        {" "}
                        conditions of use
                      </Link>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className="hidden md:block">
          <CheckoutSummary
            createdOrder={createdOrder}
            paymentMethod={paymentMethod}
            handlePlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </main>
  );
};
export default CheckoutForm;
