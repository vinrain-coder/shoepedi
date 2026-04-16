export { getErrorMessage } from "@/shared/utils";
export {
  REQUIRED_ADDRESS_FIELDS,
  shippingAddressDefaultValues,
} from "@/shared/constants";

export const toDiscountType = (value: string): "percentage" | "fixed" =>
  value === "fixed" ? "fixed" : "percentage";

export const isCardOrMobileMoneyMethod = (method?: string) => {
  const normalized = (method || "").toLowerCase();
  return (
    normalized.includes("mobile money") ||
    normalized.includes("card") ||
    normalized.includes("mpesa") ||
    normalized.includes("paystack")
  );
};
