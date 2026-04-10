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
import {
  createOrder,
  getFirstPurchaseDiscountQuote,
  SerializedOrder,
} from "@/lib/actions/order.actions";
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from "@/lib/utils";
import { ShippingAddressSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CheckoutFooter from "./checkout-footer";
import { ShippingAddress } from "@/types";
import { AddressBookEntry } from "@/types";
import useIsMounted from "@/hooks/use-is-mounted";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import ProductPrice from "@/components/shared/product/product-price";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { upsertUserAddress } from "@/lib/actions/address.actions";
import { Checkbox } from "@/components/ui/checkbox";
import Cookies from "js-cookie";
import { getUserCoins } from "@/lib/actions/user.actions";
import { getProductsByIds } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { calculateShippingPrice } from "@/lib/delivery";
import { getAllCounties, getPlacesByCounty } from "@/lib/actions/delivery-location.actions";

const PaystackInline = dynamic(
  () => import("./paystack-inline"),
  { ssr: false } // <-- only render on the client
);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";
const toDiscountType = (value: string): "percentage" | "fixed" =>
  value === "fixed" ? "fixed" : "percentage";

const shippingAddressDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
      fullName: "Basir",
      street: "1911, 65 Sherbrooke Est",
      city: "CBD",
      province: "Nairobi",
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

const CheckoutForm = ({
  savedAddresses,
  selectedAddressId,
}: {
  savedAddresses: AddressBookEntry[];
  selectedAddressId?: string;
}) => {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    _id?: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountAmount: number;
  } | null>(null);
  const [, startTransition] = useTransition();
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addressBook, setAddressBook] =
    useState<AddressBookEntry[]>(savedAddresses);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>(
    selectedAddressId ||
      savedAddresses.find((address) => address.isDefault)?.id ||
      ""
  );
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [firstPurchaseDiscount, setFirstPurchaseDiscount] = useState<{
    eligible: boolean;
    rate: number;
    discountAmount: number;
  }>({
    eligible: false,
    rate: 0,
    discountAmount: 0,
  });

  const effectiveDiscountAmount = Math.max(
    firstPurchaseDiscount.discountAmount || 0,
    appliedCoupon?.discountAmount || 0
  );

  const resetCoupon = async (message?: string) => {
    setAppliedCoupon(null);
    setCouponError(null);
    // Recalculate prices without discount
    await setCartPrices(
      items,
      shippingAddress,
      deliveryDateIndex,
      firstPurchaseDiscount.discountAmount || 0
    );
    if (message) toast.info(message);
  };

  const handleApplyCoupon = async (code?: string) => {
    if (isPlacingOrder || isApplyingCoupon) return;
    const targetCode = (typeof code === "string" ? code : couponCode || "").trim();
    if (!targetCode) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    startTransition(async () => {
      try {
        const result = await validateCoupon(targetCode, itemsPrice);

        if (!result.success || !result.data) {
          setAppliedCoupon(null);
          setCouponError(result.message || "Invalid coupon");
          toast.error(result.message || "Invalid coupon");
          return;
        }

        const { coupon, discount: couponDiscountAmount } = result.data;

        setCouponCode(coupon.code);
        const nextAppliedCoupon = {
          _id: coupon._id,
          code: coupon.code,
          discountType: toDiscountType(coupon.discountType),
          discountAmount: couponDiscountAmount,
        };
        setAppliedCoupon(nextAppliedCoupon);

        const effectiveDiscount = Math.max(
          firstPurchaseDiscount.discountAmount || 0,
          couponDiscountAmount || 0
        );

        // Update cart prices with new discount
        await setCartPrices(
          items,
          shippingAddress,
          deliveryDateIndex,
          effectiveDiscount
        );

        if ((firstPurchaseDiscount.discountAmount || 0) > (couponDiscountAmount || 0)) {
          toast.info(
            "Coupon applied, but your first-purchase discount gives better savings and remains active."
          );
        } else {
          toast.success(result.message || "Coupon applied successfully");
        }
      } catch (error: unknown) {
        setAppliedCoupon(null);
        const message = getErrorMessage(error);
        setCouponError(message);
        toast.error(message);
      } finally {
        setIsApplyingCoupon(false);
      }
    });
  };

  const {
    setting: {
      site,
      common,
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
      discount,
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
    setCartPrices,
  } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = items.map((item) => item.product);
      const uniqueProductIds = [...new Set(productIds)];
      if (uniqueProductIds.length > 0) {
        const fetchedProducts = await getProductsByIds(uniqueProductIds);
        setProducts(fetchedProducts);
      }
    };
    fetchProducts();
  }, [items]);

  const effectiveDeliveryDateIndex =
    deliveryDateIndex ?? availableDeliveryDates.length - 1;
  const selectedDeliveryDate = availableDeliveryDates[effectiveDeliveryDateIndex];
  const discountAmount = discount ?? 0;
  const finalTotal = totalPrice;

  const isMounted = useIsMounted();

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  });
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = async (
    values
  ) => {
    try {
      if (!values.province) {
        toast.error("Please select a valid county.");
        return;
      }
      if (!values.city) {
        toast.error("Please select a valid delivery place.");
        return;
      }

      await setShippingAddress(values, discountAmount);

      if (saveAddressToAccount && session) {
        const result = await upsertUserAddress({
          ...values,
          label: `Address ${addressBook.length + 1}`,
          saveAsDefault: addressBook.length === 0,
        });

        if (result.success && result.data) {
          setAddressBook(result.data);
          const selected = result.data.find(
            (address) =>
              address.street === values.street &&
              address.postalCode === values.postalCode
          );
          if (selected) setSelectedSavedAddressId(selected.id);
        }
      }
      setIsAddressSelected(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!selectedSavedAddressId) return;
    const selectedAddress = addressBook.find(
      (address) => address.id === selectedSavedAddressId
    );
    if (!selectedAddress) return;

    const mappedAddress: ShippingAddress = {
      fullName: selectedAddress.fullName,
      street: selectedAddress.street,
      city: selectedAddress.city,
      province: selectedAddress.province,
      phone: selectedAddress.phone,
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country,
    };

    shippingAddressForm.reset(mappedAddress);
    void setShippingAddress(mappedAddress);
    setIsAddressSelected(true);
  }, [
    addressBook,
    selectedSavedAddressId,
    setShippingAddress,
    shippingAddressForm,
  ]);

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
      setIsPlacingOrder(true);
      // Create the order on the server
      const res = await createOrder({
        items,
        shippingAddress,
        expectedDeliveryDate: calculateFutureDate(
          selectedDeliveryDate.daysToDeliver
        ),
        deliveryDateIndex: effectiveDeliveryDateIndex,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discount: discountAmount,
        totalPrice,
        coupon: appliedCoupon
          ? {
              _id: appliedCoupon._id,
              code: appliedCoupon.code,
              discountType: appliedCoupon.discountType,
              discountAmount: appliedCoupon.discountAmount,
            }
          : undefined,
      });

      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to create order");
        return;
      }

      const order = res.data as SerializedOrder;
      toast.success("Order created!");

      clearCart();

      if (paymentMethod === "Cash On Delivery" || paymentMethod === "Coins") {
        router.push(`/account/orders/${order._id}/placed`);
        return;
      }

      // For Paystack payment, render component and auto-open popup instantly
      setCreatedOrder(order);
      toast.success("Opening payment... Please wait.");
    } catch (error: unknown) {
      console.error("Error placing order:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true);
    setIsPaymentMethodSelected(true);
  };
  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)();
  };
  const [createdOrder, setCreatedOrder] = useState<SerializedOrder | null>(
    null
  );

  const [liveUserCoins, setLiveUserCoins] = useState<number | null>(null);
  const selectedCounty = shippingAddressForm.watch("province");
  const selectedPlace = shippingAddressForm.watch("city");

  const [counties, setCounties] = useState<string[]>([]);
  const [places, setPlaces] = useState<{ city: string; rate: number }[]>([]);
  const [countiesError, setCountiesError] = useState<string | null>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    getAllCounties()
      .then((data) => {
        setCounties(data);
        setCountiesError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch counties:", error);
        setCounties([]);
        setCountiesError("Failed to load counties. Please try again.");
      });
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      getPlacesByCounty(selectedCounty)
        .then((data) => {
          setPlaces(data);
          setPlacesError(null);
        })
        .catch((error) => {
          console.error("Failed to fetch places for county:", selectedCounty, error);
          setPlaces([]);
          setPlacesError("Failed to load delivery places. Please try again.");
        });
    } else {
      setPlaces([]);
      setPlacesError(null);
    }
  }, [selectedCounty]);

  useEffect(() => {
    getUserCoins().then((coins) => {
      if (coins !== null) setLiveUserCoins(coins);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchFirstPurchaseDiscount = async () => {
      const quote = await getFirstPurchaseDiscountQuote(itemsPrice);
      if (cancelled) return;
      setFirstPurchaseDiscount(quote);

      const effectiveDiscount = Math.max(
        quote.discountAmount || 0,
        appliedCoupon?.discountAmount || 0
      );
      await setCartPrices(
        items,
        shippingAddress,
        deliveryDateIndex,
        effectiveDiscount
      );
    };

    if (itemsPrice <= 0) {
      setFirstPurchaseDiscount({ eligible: false, rate: 0, discountAmount: 0 });
      return;
    }

    void fetchFirstPurchaseDiscount();
    return () => {
      cancelled = true;
    };
  }, [
    appliedCoupon?.discountAmount,
    deliveryDateIndex,
    items,
    itemsPrice,
    setCartPrices,
    shippingAddress,
  ]);

  const hasAutoApplied = useRef(false);
  useEffect(() => {
    // Only attempt auto-application once when itemsPrice is available
    if (itemsPrice > 0 && !appliedCoupon && !isApplyingCoupon && !hasAutoApplied.current) {
      const affiliateCode = Cookies.get("affiliate_code");
      if (affiliateCode) {
        hasAutoApplied.current = true;
        handleApplyCoupon(affiliateCode);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPrice, appliedCoupon]);
  const selectedSavedAddress = useMemo(
    () => addressBook.find((address) => address.id === selectedSavedAddressId),
    [addressBook, selectedSavedAddressId]
  );
  const renderCheckoutSummary = ({
    createdOrder,
    paymentMethod,
    handlePlaceOrder,
  }: {
    createdOrder: SerializedOrder | null;
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
                placeholder={
                  paymentMethod === "Coins"
                    ? "Coupons not allowed with Coins"
                    : firstPurchaseDiscount.eligible && !appliedCoupon
                    ? "First discount applied"
                    : "Enter coupon code"
                }
                disabled={
                  paymentMethod === "Coins" ||
                  (firstPurchaseDiscount.eligible && !appliedCoupon)
                }
              />
              <Button
                type="button"
                onClick={() => {
                  void handleApplyCoupon();
                }}
                disabled={
                  isApplyingCoupon ||
                  paymentMethod === "Coins" ||
                  (firstPurchaseDiscount.eligible && !appliedCoupon)
                }
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </Button>
            </div>
            {couponError && (
              <div
                className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}
            {appliedCoupon && discountAmount > 0 && (
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <p>
                  Coupon{" "}
                  <span className="font-medium">{appliedCoupon.code}</span>{" "}
                  applied{" "}
                  {(appliedCoupon.discountAmount || 0) < (firstPurchaseDiscount.discountAmount || 0)
                    ? "(first-purchase discount gives better savings)"
                    : "— you saved"}{" "}
                  <span className="text-green-600">
                    <ProductPrice
                      price={
                        (appliedCoupon.discountAmount || 0) < (firstPurchaseDiscount.discountAmount || 0)
                          ? firstPurchaseDiscount.discountAmount
                          : discountAmount
                      }
                      plain
                    />
                  </span>
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => resetCoupon()}
                >
                  Remove
                </Button>
              </div>
            )}
            {firstPurchaseDiscount.eligible && !appliedCoupon && effectiveDiscountAmount > 0 && (
              <div className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700">
                First purchase offer applied ({firstPurchaseDiscount.rate}% off items): you save{" "}
                <span className="font-semibold">
                  <ProductPrice price={firstPurchaseDiscount.discountAmount} plain />
                </span>
                .
              </div>
            )}
            <div className="text-lg font-bold">Order Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between text-orange-600 font-medium">
                <span>Coins to earn ({common.coinsRewardRate}%):</span>
                <span>{coinsToEarn} coins</span>
              </div>
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
                <span> Tax ({common.taxRate}%):</span>
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
                <span>
                  {effectiveDiscountAmount === (firstPurchaseDiscount.discountAmount || 0)
                    ? `First Purchase Discount (${firstPurchaseDiscount.rate}%)`
                    : "Coupon Discount"}
                  :
                </span>
                <span>
                  -<ProductPrice price={discountAmount} plain />
                </span>
              </div>
            )}

            <div className="flex justify-between  pt-4 font-bold text-lg">
              <span> Order Total:</span>
              <span>
                <ProductPrice price={finalTotal} plain />
              </span>
            </div>
          </div>
        </div>
        <div>
          <Button
            onClick={handlePlaceOrder}
            className="rounded-full w-full cursor-pointer"
            disabled={isPlacingOrder}
            hidden={
              paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" &&
              !!createdOrder
            }
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="animate-spin" /> Placing order...
              </>
            ) : (
              "Place Your Order"
            )}
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
  const userCoins =
    liveUserCoins !== null
      ? liveUserCoins
      : Number((session?.user as { coins?: number } | undefined)?.coins ?? 0);
  const coinsToEarn = Math.round(itemsPrice * (common.coinsRewardRate / 100) * 100) / 100;

  const finalAvailablePaymentMethods = useMemo(() => {
    const methods = [...availablePaymentMethods];
    if (userCoins >= finalTotal) {
      if (!methods.find((m) => m.name === "Coins")) {
        methods.push({ name: "Coins", commission: 0 });
      }
    }
    return methods;
  }, [availablePaymentMethods, userCoins, finalTotal]);

  useEffect(() => {
    if (paymentMethod === "Coins") {
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError(null);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (!session) return;
    setSaveAddressToAccount(true);
  }, [session]);

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
                {addressBook.length > 0 && (
                  <Card className="md:ml-8 my-4">
                    <CardContent className="p-4 space-y-3">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Select a saved address
                      </div>
                      <RadioGroup
                        value={selectedSavedAddressId}
                        onValueChange={setSelectedSavedAddressId}
                        className="space-y-2"
                      >
                        {addressBook.map((address) => (
                          <div
                            key={address.id}
                            onClick={() =>
                              setSelectedSavedAddressId(address.id)
                            }
                            className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                              selectedSavedAddressId === address.id
                                ? "border-2 border-primary bg-primary/5 shadow-md"
                                : "hover:border-primary/40"
                            }`}
                          >
                            <RadioGroupItem
                              value={address.id}
                              id={`saved-address-${address.id}`}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`saved-address-${address.id}`}
                              className="w-full min-w-0 cursor-pointer text-sm leading-relaxed"
                            >
                              <span className="font-medium inline-flex items-center gap-2">
                                {address.label}
                                {address.isDefault && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                    Default
                                  </span>
                                )}
                              </span>
                              <p className="break-words">{address.fullName}</p>
                              <p className="break-words">
                                {address.street}, {address.city},{" "}
                                {address.province}, {address.postalCode},{" "}
                                {address.country}
                              </p>
                              <p className="break-words text-muted-foreground">
                                {address.phone}
                              </p>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {selectedSavedAddress && (
                        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700">
                          <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                          {selectedSavedAddress.label} is selected and will be
                          used for delivery.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Link href="/account/addresses?returnTo=/checkout">
                          <Button type="button" variant="outline" size="sm">
                            Manage/Add addresses
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSavedAddressId("");
                            setIsAddressSelected(false);
                            shippingAddressForm.reset(
                              shippingAddressDefaultValues
                            );
                          }}
                        >
                          Enter a new address
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="saveAddressToAccount"
                            checked={saveAddressToAccount}
                            onCheckedChange={(value) =>
                              setSaveAddressToAccount(Boolean(value))
                            }
                          />
                          <Label htmlFor="saveAddressToAccount">
                            Save this address to my account
                          </Label>
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
                            name="province"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>County</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value}
                                    onValueChange={(val) => {
                                      field.onChange(val);
                                      shippingAddressForm.setValue("city", "");
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select county" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {counties.map((c) => (
                                        <SelectItem key={c} value={c}>
                                          {c}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                {countiesError && (
                                  <p className="text-xs text-destructive mt-1">
                                    {countiesError}
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Delivery place</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={!selectedCounty || places.length === 0}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select delivery place" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {places.map(
                                        (p) => (
                                          <SelectItem
                                            key={p.city}
                                            value={p.city}
                                          >
                                            {p.city} (
                                            <ProductPrice
                                              price={p.rate}
                                              plain
                                            />
                                            )
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                {!selectedCounty && (
                                  <p className="text-xs text-muted-foreground">
                                    Select a county first to load delivery places.
                                  </p>
                                )}
                                {placesError && (
                                  <p className="text-xs text-destructive mt-1">
                                    {placesError}
                                  </p>
                                )}
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
                      {finalAvailablePaymentMethods.map((pm) => (
                        <div key={pm.name} className="flex items-center py-1 ">
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
                              selectedDeliveryDate.daysToDeliver
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
                              selectedDeliveryDate.daysToDeliver
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
                              <p className="font-semibold">{item.name}</p>
                              <p className="font-bold">
                                <ProductPrice price={item.price} plain />
                              </p>

                              <div className="flex flex-wrap gap-2 my-2">
                                <Select
                                  value={item.color}
                                  onValueChange={(value) =>
                                    updateItem(
                                      item,
                                      item.quantity,
                                      value,
                                      item.size
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-auto cursor-pointer">
                                    <SelectValue>{item.color}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent position="popper">
                                    {(() => {
                                      const foundProduct = products.find(
                                        (p) => p._id.toString() === item.product
                                      );
                                      return (foundProduct?.colors ?? []).map(
                                        (color) => (
                                          <SelectItem key={color} value={color}>
                                            {color}
                                          </SelectItem>
                                        )
                                      );
                                    })()}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={item.size}
                                  onValueChange={(value) =>
                                    updateItem(
                                      item,
                                      item.quantity,
                                      item.color,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-auto cursor-pointer">
                                    <SelectValue>{item.size}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent position="popper">
                                    {(() => {
                                      const foundProduct = products.find(
                                        (p) => p._id.toString() === item.product
                                      );
                                      return (foundProduct?.sizes ?? []).map(
                                        (size) => (
                                          <SelectItem key={size} value={size}>
                                            {size}
                                          </SelectItem>
                                        )
                                      );
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
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className=" font-bold">
                          <p className="mb-2"> Choose a shipping speed:</p>
                          <p className="mb-3 text-xs font-normal text-muted-foreground">
                            Rates combine the selected delivery place base rate
                            and the shipping speed charge.
                          </p>

                          <ul>
                            <RadioGroup
                              value={
                                selectedDeliveryDate.name
                              }
                              onValueChange={(value) =>
                                setDeliveryDateIndex(
                                  availableDeliveryDates.findIndex(
                                    (address) => address.name === value
                                    )!,
                                    discountAmount
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
                                      {(() => {
                                        const placeRecord = places.find(p => p.city === selectedPlace);
                                        const locationRate = placeRecord?.rate ?? 0;
                                        const totalPrice = calculateShippingPrice({
                                          deliveryDate: dd,
                                          itemsPrice,
                                          shippingRate: locationRate,
                                        }) ?? 0;

                                        if (totalPrice === 0) return "FREE Shipping";

                                        return (
                                          <div className="flex flex-col">
                                            <span className="font-bold">
                                              <ProductPrice price={totalPrice} plain />
                                            </span>
                                            {locationRate > 0 && (
                                              <span className="text-[10px] text-muted-foreground font-normal">
                                                (Speed: <ProductPrice price={dd.shippingPrice} plain /> + Location: <ProductPrice price={locationRate} plain />)
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })()}
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
                {renderCheckoutSummary({
                  createdOrder,
                  paymentMethod,
                  handlePlaceOrder,
                })}
                {paymentMethod === "Mobile Money (M-Pesa / Airtel) & Card" &&
                  createdOrder && (
                    <PaystackInline
                      email={session?.user.email as string}
                      amount={Math.round(finalTotal * 100)}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                      orderId={createdOrder._id}
                      autoStart={true}
                      hideButton={true}
                      onSuccess={() =>
                        router.push(
                          `/account/orders/${createdOrder._id}/placed`
                        )
                      }
                      onFailure={() =>
                        router.push(
                          `/account/orders/${createdOrder._id}/placed`
                        )
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
                      amount={Math.round(finalTotal * 100)}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                      orderId={createdOrder._id}
                      autoStart={true}
                      hideButton={true}
                      onSuccess={() =>
                        router.push(
                          `/account/orders/${createdOrder._id}/placed`
                        )
                      }
                      onFailure={() =>
                        router.push(
                          `/account/orders/${createdOrder._id}/placed`
                        )
                      }
                    />
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      className="rounded-full cursor-pointer flex items-center gap-2"
                      disabled={isPlacingOrder}
                      hidden={
                        paymentMethod ===
                          "Mobile Money (M-Pesa / Airtel) & Card" &&
                        !!createdOrder
                      }
                    >
                      {isPlacingOrder ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Placing
                          order...
                        </>
                      ) : (
                        "Place Your Order"
                      )}
                    </Button>
                  )}

                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      Order Total: <ProductPrice price={finalTotal} plain />
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
          {renderCheckoutSummary({
            createdOrder,
            paymentMethod,
            handlePlaceOrder,
          })}
        </div>
      </div>
    </main>
  );
};
export default CheckoutForm;
