import Link from "next/link";
import { AlertCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProductPrice from "@/components/shared/product/product-price";
import { SerializedOrder } from "@/lib/actions/order.actions";
import { isCardOrMobileMoneyMethod } from "@/features/checkout/utils/checkout-helpers";
import { AppliedCoupon, FirstPurchaseDiscountState } from "@/features/checkout/types";

type Props = {
  isAddressSelected: boolean;
  isPaymentMethodSelected: boolean;
  isSubmittingAddress: boolean;
  handleSelectShippingAddress: () => void;
  handleSelectPaymentMethod: () => void;
  showCouponInput: boolean;
  setShowCouponInput: (show: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  paymentMethod: string;
  couponCode: string;
  setCouponCode: (code: string) => void;
  firstPurchaseDiscount: FirstPurchaseDiscountState;
  isApplyingCoupon: boolean;
  handleApplyCoupon: () => void;
  couponError: string | null;
  discountAmount: number;
  effectiveDiscountAmount: number;
  resetCoupon: () => void;
  commonCoinsRewardRate: number;
  coinsToEarn: number;
  itemsPrice: number;
  shippingPrice?: number;
  taxRate: number;
  taxPrice?: number;
  finalTotal: number;
  placeOrderBlockReason: string | null;
  handlePlaceOrder: () => void;
  canPlaceOrder: boolean;
  isPlacingOrder: boolean;
  siteName: string;
  createdOrder: SerializedOrder | null;
};

export function CheckoutOrderSummaryCard(props: Props) {
  const {
    isAddressSelected,
    isPaymentMethodSelected,
    isSubmittingAddress,
    handleSelectShippingAddress,
    handleSelectPaymentMethod,
    showCouponInput,
    setShowCouponInput,
    appliedCoupon,
    paymentMethod,
    couponCode,
    setCouponCode,
    firstPurchaseDiscount,
    isApplyingCoupon,
    handleApplyCoupon,
    couponError,
    discountAmount,
    effectiveDiscountAmount,
    resetCoupon,
    commonCoinsRewardRate,
    coinsToEarn,
    itemsPrice,
    shippingPrice,
    taxRate,
    taxPrice,
    finalTotal,
    placeOrderBlockReason,
    handlePlaceOrder,
    canPlaceOrder,
    isPlacingOrder,
    siteName,
    createdOrder,
  } = props;

  return (
    <Card>
      <CardContent className="p-4">
        {!isAddressSelected && (
          <div className="border-b mb-4">
            <Button className="rounded-full w-full cursor-pointer" onClick={handleSelectShippingAddress} disabled={isSubmittingAddress}>
              {isSubmittingAddress ? "Saving address..." : "Ship to this address"}
            </Button>
          </div>
        )}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className="mb-4">
            <Button className="rounded-full w-full cursor-pointer" onClick={handleSelectPaymentMethod}>
              Use this payment method
            </Button>
          </div>
        )}

        <div className="mb-4">
          {!showCouponInput && !appliedCoupon && (
            <button type="button" onClick={() => setShowCouponInput(true)} className="text-sm font-medium text-primary underline">
              Got a coupon?
            </button>
          )}
          {(showCouponInput || appliedCoupon) && (
            <div className="flex gap-2 mt-2">
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
                disabled={paymentMethod === "Coins" || firstPurchaseDiscount.loading || firstPurchaseDiscount.eligible}
              />
              <Button type="button" onClick={handleApplyCoupon} disabled={isApplyingCoupon || paymentMethod === "Coins" || firstPurchaseDiscount.loading || firstPurchaseDiscount.eligible}>
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </Button>
            </div>
          )}

          {couponError && (
            <div className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive" role="alert">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{couponError}</span>
            </div>
          )}

          {appliedCoupon && discountAmount > 0 && (
            <div className="mt-2 flex items-center justify-between gap-2 text-sm">
              <p>Coupon <span className="font-medium">{appliedCoupon.code}</span> applied</p>
              <Button type="button" variant="ghost" size="sm" onClick={resetCoupon}>Remove</Button>
            </div>
          )}

          <div className="text-lg font-bold">Order Summary</div>
          <div className="space-y-2">
            <div className="flex justify-between text-orange-600 font-medium">
              <span>Coins to earn ({commonCoinsRewardRate}%):</span>
              <span>{coinsToEarn} coins</span>
            </div>
            <div className="flex justify-between"><span>Items:</span><span><ProductPrice price={itemsPrice} plain /></span></div>
            <div className="flex justify-between"><span>Shipping & Handling:</span><span>{shippingPrice === undefined ? "--" : shippingPrice === 0 ? "FREE" : <ProductPrice price={shippingPrice} plain />}</span></div>
            <div className="flex justify-between"><span>Tax ({taxRate}%):</span><span>{taxPrice === undefined ? "--" : <ProductPrice price={taxPrice} plain />}</span></div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between"><span>Discount:</span><span>-<ProductPrice price={effectiveDiscountAmount} plain /></span></div>
          )}
          <div className="flex justify-between pt-4 font-bold text-lg"><span>Order Total:</span><span><ProductPrice price={finalTotal} plain /></span></div>
        </div>

        {placeOrderBlockReason && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800" role="status">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{placeOrderBlockReason}</span>
          </div>
        )}
        <Button onClick={handlePlaceOrder} className="rounded-full w-full cursor-pointer" disabled={!canPlaceOrder} hidden={isCardOrMobileMoneyMethod(paymentMethod) && !!createdOrder}>
          {isPlacingOrder ? <><Loader2 className="animate-spin" /> Placing order...</> : "Place Your Order"}
        </Button>
        <p className="text-xs text-center py-2">
          By placing your order, you agree to {siteName}&apos;s <Link href="/page/privacy-policy">privacy notice</Link> and
          <Link href="/page/conditions-of-use"> conditions of use</Link>.
        </p>
      </CardContent>
    </Card>
  );
}
