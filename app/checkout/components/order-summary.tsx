"use client";

import Link from "next/link";
import { AlertCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProductPrice from "@/components/shared/product/product-price";
import { SerializedOrder } from "@/lib/actions/order.actions";
import { isCardOrMobileMoneyMethod } from "../utils/checkout-helpers";

interface OrderSummaryProps {
  site: { name: string };
  common: { coinsRewardRate: number; taxRate: number };
  itemsPrice: number;
  shippingPrice: number | undefined;
  taxPrice: number | undefined;
  discountAmount: number;
  totalPrice: number;
  coinsToEarn: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  handleApplyCoupon: (code?: string) => void;
  isApplyingCoupon: boolean;
  couponError: string | null;
  resetCoupon: () => void;
  showCouponInput: boolean;
  setShowCouponInput: (show: boolean) => void;
  firstPurchaseDiscount: { eligible: boolean; rate: number; discountAmount: number; loading: boolean };
  effectiveDiscountAmount: number;
  paymentMethod: string | undefined;
  isAddressSelected: boolean;
  isPaymentMethodSelected: boolean;
  isSubmittingAddress: boolean;
  handleSelectShippingAddress: () => void;
  handleSelectPaymentMethod: () => void;
  handlePlaceOrder: () => void;
  isPlacingOrder: boolean;
  canPlaceOrder: boolean;
  placeOrderBlockReason: string | null;
  createdOrder: SerializedOrder | null;
}

export const OrderSummary = ({
  site,
  common,
  itemsPrice,
  shippingPrice,
  taxPrice,
  discountAmount,
  totalPrice,
  coinsToEarn,
  appliedCoupon,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  isApplyingCoupon,
  couponError,
  resetCoupon,
  showCouponInput,
  setShowCouponInput,
  firstPurchaseDiscount,
  effectiveDiscountAmount,
  paymentMethod,
  isAddressSelected,
  isPaymentMethodSelected,
  isSubmittingAddress,
  handleSelectShippingAddress,
  handleSelectPaymentMethod,
  handlePlaceOrder,
  isPlacingOrder,
  canPlaceOrder,
  placeOrderBlockReason,
  createdOrder,
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        {!isAddressSelected && (
          <div className="border-b mb-4">
            <Button
              className="rounded-full w-full cursor-pointer"
              onClick={handleSelectShippingAddress}
              disabled={isSubmittingAddress}
            >
              {isSubmittingAddress ? "Saving address..." : "Ship to this address"}
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
            {!showCouponInput && !appliedCoupon && (
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                className="text-sm font-medium text-primary underline hover:text-primary/80 transition-colors"
              >
                Got a coupon?
              </button>
            )}

            {(showCouponInput || appliedCoupon) && (
              <>
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
                        : firstPurchaseDiscount.loading
                        ? "Checking eligibility..."
                        : firstPurchaseDiscount.eligible
                        ? "First discount applied"
                        : "Enter coupon code"
                    }
                    disabled={
                      paymentMethod === "Coins" ||
                      firstPurchaseDiscount.loading ||
                      firstPurchaseDiscount.eligible
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
                      firstPurchaseDiscount.loading ||
                      firstPurchaseDiscount.eligible
                    }
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </>
            )}
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
            <div className="text-lg font-bold mt-4">Order Summary</div>
            <div className="space-y-2 mt-2">
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
            </div>

            <div className="flex justify-between pt-4 font-bold text-lg border-t mt-4">
              <span> Order Total:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
          </div>
        </div>
        <div>
          {placeOrderBlockReason && (
            <div
              className="my-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800"
              role="status"
              aria-live="polite"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{placeOrderBlockReason}</span>
            </div>
          )}
          <Button
            onClick={handlePlaceOrder}
            className="rounded-full w-full cursor-pointer mt-2"
            disabled={!canPlaceOrder}
            hidden={
              isCardOrMobileMoneyMethod(paymentMethod) &&
              !!createdOrder
            }
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Placing order...
              </>
            ) : (
              "Place Your Order"
            )}
          </Button>
          <p className="text-xs text-center py-2 text-muted-foreground">
            By placing your order, you agree to {site.name}&apos;s{" "}
            <Link href="/page/privacy-policy" className="underline hover:text-primary">privacy notice</Link> and
            <Link href="/page/conditions-of-use" className="underline hover:text-primary"> conditions of use</Link>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
