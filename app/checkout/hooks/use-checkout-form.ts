"use client";

import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { authClient } from "@/lib/auth-client";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import useIsMounted from "@/hooks/use-is-mounted";
import {
  createOrder,
  getFirstPurchaseDiscountQuote,
  SerializedOrder,
} from "@/lib/actions/order.actions";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { getUserAddresses, upsertUserAddress } from "@/lib/actions/address.actions";
import { getUserCoins } from "@/lib/actions/user.actions";
import { getProductsByIds } from "@/lib/actions/product.actions";
import { getAllCounties, getPlacesByCounty } from "@/lib/actions/delivery-location.actions";
import { normalizeAddressBookEntries } from "@/lib/address-book";
import { calculateFutureDate } from "@/lib/utils";
import { ShippingAddressSchema } from "@/lib/validator";
import { AddressBookEntry, ShippingAddress } from "@/types";
import { IProduct } from "@/lib/db/models/product.model";

import {
  getErrorMessage,
  toDiscountType,
  REQUIRED_ADDRESS_FIELDS,
  isCardOrMobileMoneyMethod,
  shippingAddressDefaultValues,
} from "../utils/checkout-helpers";

export const useCheckoutForm = (
  initialSavedAddresses: AddressBookEntry[],
  initialSelectedAddressId?: string
) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const isMounted = useIsMounted();

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

  // State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    _id?: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountAmount: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [createdOrder, setCreatedOrder] = useState<SerializedOrder | null>(null);
  const [liveUserCoins, setLiveUserCoins] = useState<number | null>(null);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  // Status flags
  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState<boolean>(false);
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] = useState<boolean>(false);

  // Address Book state
  const sessionAddressBook = useMemo(
    () => normalizeAddressBookEntries((session?.user as { addresses?: unknown[] } | undefined)?.addresses),
    [session?.user]
  );
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>(
    sessionAddressBook.length > 0 ? sessionAddressBook : initialSavedAddresses
  );
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>(
    initialSelectedAddressId ||
      (sessionAddressBook.length > 0 ? sessionAddressBook : initialSavedAddresses).find((address) => address.isDefault)?.id ||
      ""
  );

  // Delivery Location state
  const [counties, setCounties] = useState<string[]>([]);
  const [places, setPlaces] = useState<{ city: string; rate: number }[]>([]);
  const [countiesError, setCountiesError] = useState<string | null>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isCountiesLoading, setIsCountiesLoading] = useState(false);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  // First Purchase Discount state
  const [firstPurchaseDiscount, setFirstPurchaseDiscount] = useState<{
    eligible: boolean;
    rate: number;
    discountAmount: number;
    loading: boolean;
  }>({
    eligible: false,
    rate: 0,
    discountAmount: 0,
    loading: true,
  });

  const effectiveDiscountAmount = Math.max(
    firstPurchaseDiscount.discountAmount || 0,
    appliedCoupon?.discountAmount || 0
  );

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

  // Sync address book from session
  useEffect(() => {
    if (!session) return;
    const nextAddressBook = sessionAddressBook.length > 0 ? sessionAddressBook : initialSavedAddresses;
    setAddressBook(nextAddressBook);

    setSelectedSavedAddressId((currentId) => {
      if (currentId && nextAddressBook.some((address) => address.id === currentId)) {
        return currentId;
      }
      return (
        initialSelectedAddressId ||
        nextAddressBook.find((address) => address.isDefault)?.id ||
        nextAddressBook[0]?.id ||
        ""
      );
    });
  }, [initialSavedAddresses, initialSelectedAddressId, session, sessionAddressBook]);

  // Refresh address book from API
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

  // Fetch products in cart
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

  // Fetch counties
  useEffect(() => {
    setIsCountiesLoading(true);
    getAllCounties()
      .then((data) => {
        setCounties(data);
        setCountiesError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch counties:", error);
        setCounties([]);
        setCountiesError("Failed to load counties. Please try again.");
      })
      .finally(() => {
        setIsCountiesLoading(false);
      });
  }, []);

  // Fetch places when county changes
  useEffect(() => {
    if (selectedCounty) {
      setIsPlacesLoading(true);
      getPlacesByCounty(selectedCounty)
        .then((data) => {
          setPlaces(data);
          setPlacesError(null);
        })
        .catch((error) => {
          console.error("Failed to fetch places for county:", selectedCounty, error);
          setPlaces([]);
          setPlacesError("Failed to load delivery places. Please try again.");
        })
        .finally(() => {
          setIsPlacesLoading(false);
        });
    } else {
      setPlaces([]);
      setPlacesError(null);
      setIsPlacesLoading(false);
    }
  }, [selectedCounty]);

  // Fetch user coins
  useEffect(() => {
    getUserCoins().then((coins) => {
      if (coins !== null) setLiveUserCoins(coins);
    });
  }, []);

  // Fetch first purchase discount
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

  // Auto-apply affiliate coupon
  const hasAutoApplied = useRef(false);
  useEffect(() => {
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

  // Reset coupon logic
  const resetCoupon = async (message?: string) => {
    setAppliedCoupon(null);
    setCouponError(null);
    await setCartPrices(
      items,
      shippingAddress,
      deliveryDateIndex,
      firstPurchaseDiscount.discountAmount || 0
    );
    if (message) toast.info(message);
  };

  // Apply coupon logic
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

  // Shipping address logic
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = async (values) => {
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

      await setShippingAddress(values, discount || 0);

      if (saveAddressToAccount && session) {
        const result = await upsertUserAddress({
          ...values,
          label: `Address ${addressBook.length + 1}`,
          saveAsDefault: addressBook.length === 0,
        });

        if (result.success && result.data) {
          const updatedBook = normalizeAddressBookEntries(result.data);
          setAddressBook(updatedBook);
          const selected = updatedBook.find(
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

  // Sync form with selected saved address
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
  }, [addressBook, selectedSavedAddressId, setShippingAddress, shippingAddressForm]);

  // Sync form with cart shipping address on mount
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

  // Selection handlers
  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true);
    setIsPaymentMethodSelected(true);
  };

  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)();
  };

  // Place order logic
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
      const res = await createOrder({
        items,
        shippingAddress,
        userEmail: shippingAddress?.email || (session?.user?.email as string),
        userName: shippingAddress?.fullName || (session?.user?.name as string),
        expectedDeliveryDate: calculateFutureDate(
          availableDeliveryDates[deliveryDateIndex ?? availableDeliveryDates.length - 1].daysToDeliver
        ),
        deliveryDateIndex: deliveryDateIndex ?? availableDeliveryDates.length - 1,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discount: discount || 0,
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

  // Helper values
  const userCoins = liveUserCoins !== null
    ? liveUserCoins
    : Number((session?.user as { coins?: number } | undefined)?.coins ?? 0);

  const coinsToEarn = Math.round(itemsPrice * (common.coinsRewardRate / 100) * 100) / 100;

  const hasCompleteShippingAddress = useMemo(
    () =>
      REQUIRED_ADDRESS_FIELDS.every((field) =>
        Boolean(shippingAddress?.[field]?.toString().trim())
      ),
    [shippingAddress]
  );

  const hasGuestEmail = Boolean(session?.user?.email || shippingAddress?.email?.trim());

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

  const finalAvailablePaymentMethods = useMemo(() => {
    const methods = [...availablePaymentMethods];
    if (userCoins >= totalPrice) {
      if (!methods.find((m) => m.name === "Coins")) {
        methods.push({ name: "Coins", commission: 0 });
      }
    }
    return methods;
  }, [availablePaymentMethods, userCoins, totalPrice]);

  // Update payment method effects
  useEffect(() => {
    if (paymentMethod === "Coins") {
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError(null);
    }
  }, [paymentMethod]);

  return {
    // State
    session,
    site,
    common,
    availablePaymentMethods: finalAvailablePaymentMethods,
    availableDeliveryDates,
    items,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discount: discount || 0,
    totalPrice,
    shippingAddress,
    deliveryDateIndex,
    paymentMethod,
    couponCode,
    appliedCoupon,
    isApplyingCoupon,
    isSubmittingAddress,
    couponError,
    isPlacingOrder,
    showCouponInput,
    products,
    createdOrder,
    userCoins,
    coinsToEarn,
    saveAddressToAccount,
    addressBook,
    selectedSavedAddressId,
    counties,
    places,
    isCountiesLoading,
    isPlacesLoading,
    countiesError,
    placesError,
    firstPurchaseDiscount,
    effectiveDiscountAmount,
    shippingAddressForm,
    selectedCounty,
    selectedPlace,
    isAddressSelected,
    isPaymentMethodSelected,
    isDeliveryDateSelected,
    canPlaceOrder,
    placeOrderBlockReason,

    // Actions
    setCouponCode,
    setShowCouponInput,
    setSaveAddressToAccount,
    setSelectedSavedAddressId,
    setPaymentMethod,
    setDeliveryDateIndex,
    updateItem,
    removeItem,
    resetCoupon,
    handleApplyCoupon,
    handlePlaceOrder,
    handleSelectPaymentMethod,
    handleSelectShippingAddress,
    setIsAddressSelected,
    setIsPaymentMethodSelected,
    setIsDeliveryDateSelected,
  };
};
