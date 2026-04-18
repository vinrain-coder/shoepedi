import { ShippingAddress } from "@/types";

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const toDiscountType = (value: string): "percentage" | "fixed" =>
  value === "fixed" ? "fixed" : "percentage";

export const REQUIRED_ADDRESS_FIELDS: Array<keyof ShippingAddress> = [
  "fullName",
  "street",
  "city",
  "province",
  "phone",
  "postalCode",
  "country",
];

export const isCashOnDeliveryMethod = (method?: string) => {
  const normalized = (method || "").toLowerCase();
  return (
    normalized.includes("cash") ||
    normalized.includes("delivery") ||
    normalized.includes("cod")
  );
};

export const isCardOrMobileMoneyMethod = (method?: string) => {
  const normalized = (method || "").toLowerCase();
  return (
    normalized.includes("mobile money") ||
    normalized.includes("card") ||
    normalized.includes("mpesa") ||
    normalized.includes("paystack")
  );
};

export const shippingAddressDefaultValues =
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
        country: "Kenya",
      };
