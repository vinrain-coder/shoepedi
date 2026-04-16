"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  createOrder,
  getFirstPurchaseDiscountQuote,
  SerializedOrder,
} from "@/lib/actions/order.actions";
import {
  calculateFutureDate,
} from "@/lib/utils";
import { ShippingAddressSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CheckoutFooter from "./checkout-footer";
import { ShippingAddress } from "@/types";
import { AddressBookEntry } from "@/types";
import useIsMounted from "@/hooks/use-is-mounted";
import { z } from "zod";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import ProductPrice from "@/components/shared/product/product-price";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { getUserAddresses, upsertUserAddress } from "@/lib/actions/address.actions";
import Cookies from "js-cookie";
import { normalizeAddressBookEntries } from "@/lib/address-book";
import {
  CheckoutOrderSummaryCard,
  CheckoutItemsShippingSection,
  CheckoutPaymentSection,
  CheckoutShippingSection,
} from "@/features/checkout/components";
import { useCheckoutReferenceData } from "@/features/checkout/hooks";
import {
  getErrorMessage,
  isCardOrMobileMoneyMethod,
  REQUIRED_ADDRESS_FIELDS,
  shippingAddressDefaultValues,
  toDiscountType,
} from "@/features/checkout/utils";
import {
  AppliedCoupon,
  FirstPurchaseDiscountState,
} from "@/features/checkout/types";

const PaystackInline = dynamic(
  () => import("./paystack-inline"),
  { ssr: false } // <-- only render on the client
);


const CheckoutForm = ({
  savedAddresses,
  selectedAddressId,
}: {
  savedAddresses: AddressBookEntry[];
  selectedAddressId?: string;
}) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [, startTransition] = useTransition();
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const sessionAddressBook = useMemo(
    () => normalizeAddressBookEntries((session?.user as { addresses?: unknown[] } | undefined)?.addresses),
    [session?.user]
  );
  const [addressBook, setAddressBook] =
    useState<AddressBookEntry[]>(sessionAddressBook.length > 0 ? sessionAddressBook : savedAddresses);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>(
    selectedAddressId ||
      (sessionAddressBook.length > 0 ? sessionAddressBook : savedAddresses).find((address) => address.isDefault)?.id ||
      ""
  );
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [firstPurchaseDiscount, setFirstPurchaseDiscount] = useState<FirstPurchaseDiscountState>({
    eligible: false,
    rate: 0,
    discountAmount: 0,
    loading: true,
  });

  const effectiveDiscountAmount = Math.max(
    firstPurchaseDiscount.discountAmount || 0,
    appliedCoupon?.discountAmount || 0
  );

  useEffect(() => {
    if (!session) return;

    const nextAddressBook = sessionAddressBook.length > 0 ? sessionAddressBook : savedAddresses;
    setAddressBook(nextAddressBook);

    setSelectedSavedAddressId((currentId) => {
      if (currentId && nextAddressBook.some((address) => address.id === currentId)) {
        return currentId;
      }

      return (
        selectedAddressId ||
        nextAddressBook.find((address) => address.isDefault)?.id ||
        nextAddressBook[0]?.id ||
        ""
      );
    });
  }, [savedAddresses, selectedAddressId, session, sessionAddressBook]);

  useEffect(() => {
    if (!session) return;
    let disposed = false;

    getUserAddresses()
      .then((result) => {
        if (disposed || !result.success || !result.data) return;
        const nextAddressBook = normalizeAddressBookEntries(result.data);
        setAddressBook(nextAddressBook);
        setSelectedSavedAddressId((currentId) => {
          if (currentId && nextAddressBook.some((address) => address.id === currentId)) {
            return currentId;
          }
          return (
            nextAddressBook.find((address) => address.isDefault)?.id ||
            nextAddressBook[0]?.id ||
            ""
          );
        });
      })
      .catch((error) => {
        console.error("Failed to refresh checkout addresses:", error);
      });

    return () => {
      disposed = true;
    };
  }, [session]);

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

  const effectiveDeliveryDateIndex =
    deliveryDateIndex ?? availableDeliveryDates.length - 1;
  const selectedDeliveryDate = availableDeliveryDates[effectiveDeliveryDateIndex];
  const discountAmount = discount ?? 0;
  const finalTotal = totalPrice;

  const isMounted = useIsMounted();

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(
      ShippingAddressSchema.extend({
        email: session ? z.string().email().optional() : z.string().email("Email is required for guest checkout"),
      })
    ),
    defaultValues: shippingAddress || { ...shippingAddressDefaultValues, email: "" },
  });
  const selectedCounty = shippingAddressForm.watch("province");
  const selectedPlace = shippingAddressForm.watch("city");
  const {
    products,
    liveUserCoins,
    counties,
    places,
    countiesError,
    placesError,
    isCountiesLoading,
    isPlacesLoading,
  } = useCheckoutReferenceData({
    productIds: items.map((item) => item.product),
    selectedCounty,
  });
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = async (
    values
  ) => {
    try {
      setIsSubmittingAddress(true);
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
    } finally {
      setIsSubmittingAddress(false);
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
    if (selectedSavedAddressId) return;
    if (shippingAddress.email) shippingAddressForm.setValue("email", shippingAddress.email);
    shippingAddressForm.setValue("fullName", shippingAddress.fullName);
    shippingAddressForm.setValue("street", shippingAddress.street);
    shippingAddressForm.setValue("city", shippingAddress.city);
    shippingAddressForm.setValue("country", shippingAddress.country);
    shippingAddressForm.setValue("postalCode", shippingAddress.postalCode);
    shippingAddressForm.setValue("province", shippingAddress.province);
    shippingAddressForm.setValue("phone", shippingAddress.phone);
  }, [isMounted, selectedSavedAddressId, shippingAddress, shippingAddressForm]);


  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false);
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] =
    useState<boolean>(false);

  const handlePlaceOrder = async () => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!shippingAddress || !hasCompleteShippingAddress) {
      toast.error("Please complete your shipping address before placing the order.");
      return;
    }
    if (!session?.user?.email && !shippingAddress.email) {
      toast.error("Please provide a valid email address for order updates.");
      return;
    }
    if (!paymentMethod || !isPaymentMethodSelected) {
      toast.error("Please select and confirm a payment method.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      // Create the order on the server
      const res = await createOrder({
        items,
        shippingAddress,
        userEmail: shippingAddress?.email || (session?.user?.email as string),
        userName: shippingAddress?.fullName || (session?.user?.name as string),
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
      toast.success("Order created!", {
        action: {
          label: "View Order",
          onClick: () => {
            router.push(
              order.isGuest
                ? `/account/orders/${order._id}/placed?accessToken=${order.accessToken}`
                : `/account/orders/${order._id}/placed`
            );
          },
        },
      });
      if (order.isGuest && order.accessToken) {
        Cookies.set(`guest_order_access_${order._id}`, order.accessToken, {
          expires: 30,
          sameSite: "lax",
        });
      }

      clearCart();

      const successPath = order.isGuest
        ? `/account/orders/${order._id}/placed?accessToken=${order.accessToken}`
        : `/account/orders/${order._id}/placed`;

      if (isCardOrMobileMoneyMethod(order.paymentMethod)) {
        // For Paystack payment, render component and auto-open popup instantly
        setCreatedOrder(order);
        toast.success("Opening payment... Please wait.");
      } else {
        window.location.href = successPath;
      }
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


  useEffect(() => {
    let cancelled = false;

    const fetchFirstPurchaseDiscount = async () => {
      setFirstPurchaseDiscount((prev) => ({ ...prev, loading: true }));
      const quote = await getFirstPurchaseDiscountQuote(itemsPrice, shippingAddress?.email);
      if (cancelled) return;
      setFirstPurchaseDiscount({ ...quote, loading: false });

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
      setFirstPurchaseDiscount({ eligible: false, rate: 0, discountAmount: 0, loading: false });
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
    // Only attempt auto-application once when itemsPrice is available and eligibility is checked
    if (
      itemsPrice > 0 &&
      !firstPurchaseDiscount.loading &&
      !appliedCoupon &&
      !isApplyingCoupon &&
      !hasAutoApplied.current
    ) {
      const affiliateCode = Cookies.get("affiliate_code");
      if (affiliateCode) {
        hasAutoApplied.current = true;
        handleApplyCoupon(affiliateCode);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPrice, appliedCoupon, firstPurchaseDiscount.loading]);
  const selectedSavedAddress = useMemo(
    () => addressBook.find((address) => address.id === selectedSavedAddressId),
    [addressBook, selectedSavedAddressId]
  );

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

  const hasCompleteShippingAddress = useMemo(
    () =>
      REQUIRED_ADDRESS_FIELDS.every((field) =>
        Boolean(shippingAddress?.[field]?.toString().trim())
      ),
    [shippingAddress]
  );
  const guestEmail = shippingAddress?.email?.trim() || "";
  const hasGuestEmail = Boolean(session?.user?.email || guestEmail);
  const canPlaceOrder =
    !isPlacingOrder &&
    items.length > 0 &&
    isAddressSelected &&
    isPaymentMethodSelected &&
    hasCompleteShippingAddress &&
    hasGuestEmail &&
    Boolean(paymentMethod);
  const placeOrderBlockReason = !items.length
    ? "Your cart is empty."
    : !isAddressSelected
      ? "Complete shipping details first."
      : !hasCompleteShippingAddress
        ? "Please complete all required address fields."
        : !hasGuestEmail
          ? "A valid email is required for guest checkout updates."
          : !isPaymentMethodSelected
            ? "Select and confirm a payment method."
            : !paymentMethod
              ? "Select a payment method."
              : null;

  return (
    <main className="max-w-6xl mx-auto highlight-link">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div>
            <CheckoutShippingSection
              session={session}
              isAddressSelected={isAddressSelected}
              shippingAddress={shippingAddress}
              setIsAddressSelected={setIsAddressSelected}
              setIsPaymentMethodSelected={setIsPaymentMethodSelected}
              setIsDeliveryDateSelected={setIsDeliveryDateSelected}
              addressBook={addressBook}
              selectedSavedAddressId={selectedSavedAddressId}
              setSelectedSavedAddressId={setSelectedSavedAddressId}
              selectedSavedAddress={selectedSavedAddress}
              shippingAddressForm={shippingAddressForm}
              onSubmitShippingAddress={onSubmitShippingAddress}
              saveAddressToAccount={saveAddressToAccount}
              setSaveAddressToAccount={setSaveAddressToAccount}
              isSubmittingAddress={isSubmittingAddress}
              counties={counties}
              places={places}
              selectedCounty={selectedCounty}
              isCountiesLoading={isCountiesLoading}
              isPlacesLoading={isPlacesLoading}
              countiesError={countiesError}
              placesError={placesError}
            />
          </div>
          <div className="border-y">
            <CheckoutPaymentSection
              isAddressSelected={isAddressSelected}
              isPaymentMethodSelected={isPaymentMethodSelected}
              paymentMethod={paymentMethod}
              finalAvailablePaymentMethods={finalAvailablePaymentMethods}
              userCoins={userCoins}
              setPaymentMethod={setPaymentMethod}
              handleSelectPaymentMethod={handleSelectPaymentMethod}
              setIsPaymentMethodSelected={setIsPaymentMethodSelected}
              setIsDeliveryDateSelected={setIsDeliveryDateSelected}
            />
          </div>
          <div>
            <CheckoutItemsShippingSection
              isDeliveryDateSelected={isDeliveryDateSelected}
              deliveryDateIndex={deliveryDateIndex}
              selectedDeliveryDate={selectedDeliveryDate}
              isPaymentMethodSelected={isPaymentMethodSelected}
              isAddressSelected={isAddressSelected}
              items={items}
              products={products}
              updateItem={updateItem}
              removeItem={removeItem}
              availableDeliveryDates={availableDeliveryDates}
              setDeliveryDateIndex={setDeliveryDateIndex}
              discountAmount={discountAmount}
              selectedPlace={selectedPlace}
              places={places}
              itemsPrice={itemsPrice}
              setIsPaymentMethodSelected={setIsPaymentMethodSelected}
              setIsDeliveryDateSelected={setIsDeliveryDateSelected}
            />
          </div>
          {isPaymentMethodSelected && isAddressSelected && (
            <div className="mt-6">
              {/* Mobile summary */}
              <div className="block md:hidden">
                <CheckoutOrderSummaryCard
                  isAddressSelected={isAddressSelected}
                  isPaymentMethodSelected={isPaymentMethodSelected}
                  isSubmittingAddress={isSubmittingAddress}
                  handleSelectShippingAddress={handleSelectShippingAddress}
                  handleSelectPaymentMethod={handleSelectPaymentMethod}
                  showCouponInput={showCouponInput}
                  setShowCouponInput={setShowCouponInput}
                  appliedCoupon={appliedCoupon}
                  paymentMethod={paymentMethod}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  firstPurchaseDiscount={firstPurchaseDiscount}
                  isApplyingCoupon={isApplyingCoupon}
                  handleApplyCoupon={() => void handleApplyCoupon()}
                  couponError={couponError}
                  discountAmount={discountAmount}
                  effectiveDiscountAmount={effectiveDiscountAmount}
                  resetCoupon={() => void resetCoupon()}
                  commonCoinsRewardRate={common.coinsRewardRate}
                  coinsToEarn={coinsToEarn}
                  itemsPrice={itemsPrice}
                  shippingPrice={shippingPrice}
                  taxRate={common.taxRate}
                  taxPrice={taxPrice}
                  finalTotal={finalTotal}
                  placeOrderBlockReason={placeOrderBlockReason}
                  handlePlaceOrder={handlePlaceOrder}
                  canPlaceOrder={canPlaceOrder}
                  isPlacingOrder={isPlacingOrder}
                  siteName={site.name}
                  createdOrder={createdOrder}
                />
                {isCardOrMobileMoneyMethod(paymentMethod) &&
                  createdOrder && (
                    <PaystackInline
                      email={(session?.user?.email || shippingAddress?.email) as string}
                      amount={Math.round(finalTotal * 100)}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                      orderId={createdOrder._id}
                      autoStart={true}
                      hideButton={true}
                      onSuccess={() => {
                        window.location.href = createdOrder.isGuest
                          ? `/account/orders/${createdOrder._id}/placed?accessToken=${createdOrder.accessToken}`
                          : `/account/orders/${createdOrder._id}/placed`;
                      }}
                      onFailure={() => {
                        window.location.href = createdOrder.isGuest
                          ? `/account/orders/${createdOrder._id}/placed?accessToken=${createdOrder.accessToken}`
                          : `/account/orders/${createdOrder._id}/placed`;
                      }}
                    />
                  )}
              </div>

              <Card className="hidden md:block ">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                  {isCardOrMobileMoneyMethod(paymentMethod) &&
                  createdOrder ? (
                    <PaystackInline
                      email={(session?.user?.email || shippingAddress?.email) as string}
                      amount={Math.round(finalTotal * 100)}
                      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                      orderId={createdOrder._id}
                      autoStart={true}
                      hideButton={true}
                      onSuccess={() => {
                        window.location.href = createdOrder.isGuest
                          ? `/account/orders/${createdOrder._id}/placed?accessToken=${createdOrder.accessToken}`
                          : `/account/orders/${createdOrder._id}/placed`;
                      }}
                      onFailure={() => {
                        window.location.href = createdOrder.isGuest
                          ? `/account/orders/${createdOrder._id}/placed?accessToken=${createdOrder.accessToken}`
                          : `/account/orders/${createdOrder._id}/placed`;
                      }}
                    />
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      className="rounded-full cursor-pointer flex items-center gap-2"
                      disabled={!canPlaceOrder}
                      hidden={
                        isCardOrMobileMoneyMethod(paymentMethod) &&
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
          <CheckoutOrderSummaryCard
            isAddressSelected={isAddressSelected}
            isPaymentMethodSelected={isPaymentMethodSelected}
            isSubmittingAddress={isSubmittingAddress}
            handleSelectShippingAddress={handleSelectShippingAddress}
            handleSelectPaymentMethod={handleSelectPaymentMethod}
            showCouponInput={showCouponInput}
            setShowCouponInput={setShowCouponInput}
            appliedCoupon={appliedCoupon}
            paymentMethod={paymentMethod}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            firstPurchaseDiscount={firstPurchaseDiscount}
            isApplyingCoupon={isApplyingCoupon}
            handleApplyCoupon={() => void handleApplyCoupon()}
            couponError={couponError}
            discountAmount={discountAmount}
            effectiveDiscountAmount={effectiveDiscountAmount}
            resetCoupon={() => void resetCoupon()}
            commonCoinsRewardRate={common.coinsRewardRate}
            coinsToEarn={coinsToEarn}
            itemsPrice={itemsPrice}
            shippingPrice={shippingPrice}
            taxRate={common.taxRate}
            taxPrice={taxPrice}
            finalTotal={finalTotal}
            placeOrderBlockReason={placeOrderBlockReason}
            handlePlaceOrder={handlePlaceOrder}
            canPlaceOrder={canPlaceOrder}
            isPlacingOrder={isPlacingOrder}
            siteName={site.name}
            createdOrder={createdOrder}
          />
        </div>
      </div>
    </main>
  );
};
export default CheckoutForm;
