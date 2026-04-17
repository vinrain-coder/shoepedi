"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { AddressBookEntry } from "@/types";
import ProductPrice from "@/components/shared/product/product-price";
import {
  CheckoutOrderSummaryCard,
  CheckoutItemsShippingSection,
  CheckoutPaymentSection,
  CheckoutShippingSection,
  CheckoutFooter,
} from "@/features/checkout/components";
import { useCheckoutForm } from "@/features/checkout/hooks";
import { isCardOrMobileMoneyMethod } from "@/features/checkout/utils";

const PaystackInline = dynamic(
  () => import("@/features/checkout/components/paystack-inline"),
  { ssr: false }
);

const CheckoutForm = ({
  savedAddresses,
  selectedAddressId,
}: {
  savedAddresses: AddressBookEntry[];
  selectedAddressId?: string;
}) => {
  const {
    session,
    couponCode,
    setCouponCode,
    appliedCoupon,
    isApplyingCoupon,
    isSubmittingAddress,
    couponError,
    isPlacingOrder,
    addressBook,
    selectedSavedAddressId,
    setSelectedSavedAddressId,
    saveAddressToAccount,
    setSaveAddressToAccount,
    showCouponInput,
    setShowCouponInput,
    firstPurchaseDiscount,
    effectiveDiscountAmount,
    isAddressSelected,
    setIsAddressSelected,
    isPaymentMethodSelected,
    setIsPaymentMethodSelected,
    isDeliveryDateSelected,
    setIsDeliveryDateSelected,
    createdOrder,
    site,
    common,
    items,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    finalTotal,
    shippingAddress,
    deliveryDateIndex,
    paymentMethod,
    setPaymentMethod,
    updateItem,
    removeItem,
    setDeliveryDateIndex,
    shippingAddressForm,
    products,
    userCoins,
    counties,
    places,
    countiesError,
    placesError,
    isCountiesLoading,
    isPlacesLoading,
    selectedCounty,
    selectedPlace,
    onSubmitShippingAddress,
    handlePlaceOrder,
    handleSelectPaymentMethod,
    handleSelectShippingAddress,
    resetCoupon,
    handleApplyCoupon,
    selectedSavedAddress,
    coinsToEarn,
    finalAvailablePaymentMethods,
    canPlaceOrder,
    placeOrderBlockReason,
  } = useCheckoutForm({ savedAddresses, selectedAddressId });

  const summaryProps = {
    isAddressSelected,
    isPaymentMethodSelected,
    isSubmittingAddress,
    handleSelectShippingAddress,
    handleSelectPaymentMethod,
    showCouponInput,
    setShowCouponInput,
    appliedCoupon,
    paymentMethod: paymentMethod || "",
    couponCode,
    setCouponCode,
    firstPurchaseDiscount,
    isApplyingCoupon,
    handleApplyCoupon: () => void handleApplyCoupon(),
    couponError,
    discountAmount,
    effectiveDiscountAmount,
    resetCoupon: () => void resetCoupon(),
    commonCoinsRewardRate: common.coinsRewardRate,
    coinsToEarn,
    itemsPrice,
    shippingPrice,
    taxRate: common.taxRate,
    taxPrice,
    finalTotal,
    placeOrderBlockReason,
    handlePlaceOrder,
    canPlaceOrder,
    isPlacingOrder,
    siteName: site.name,
    createdOrder,
  };

  const paystackProps = createdOrder ? {
    email: (session?.user?.email || shippingAddress?.email) as string,
    amount: Math.round(finalTotal * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    orderId: createdOrder._id,
    autoStart: true,
    hideButton: true,
    onSuccess: () => {
      window.location.href = createdOrder.isGuest
        ? `/account/orders/${createdOrder._id}/placed?accessToken=${createdOrder.accessToken}`
        : `/account/orders/${createdOrder._id}/placed`;
    },
    onFailure: () => {
      window.location.href = createdOrder.isGuest
        ? `/account/orders/${createdOrder._id}/placed?accessToken=${createdOrder.accessToken}`
        : `/account/orders/${createdOrder._id}/placed`;
    },
  } : null;

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
              paymentMethod={paymentMethod || ""}
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
              selectedDeliveryDate={common.availableDeliveryDates[deliveryDateIndex ?? common.availableDeliveryDates.length - 1]}
              isPaymentMethodSelected={isPaymentMethodSelected}
              isAddressSelected={isAddressSelected}
              items={items}
              products={products}
              updateItem={updateItem}
              removeItem={removeItem}
              availableDeliveryDates={common.availableDeliveryDates}
              setDeliveryDateIndex={setDeliveryDateIndex}
              discountAmount={discountAmount}
              selectedPlace={selectedPlace || ""}
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
                <CheckoutOrderSummaryCard {...summaryProps} />
                {isCardOrMobileMoneyMethod(paymentMethod) && paystackProps && (
                  <PaystackInline {...paystackProps} />
                )}
              </div>

              <Card className="hidden md:block ">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                  {isCardOrMobileMoneyMethod(paymentMethod) && paystackProps ? (
                    <PaystackInline {...paystackProps} />
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      className="rounded-full cursor-pointer flex items-center gap-2"
                      disabled={!canPlaceOrder}
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
                      By placing your order, you agree to {site.name}&apos;s{" "}
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
          <CheckoutOrderSummaryCard {...summaryProps} />
        </div>
      </div>
    </main>
  );
};
export default CheckoutForm;
