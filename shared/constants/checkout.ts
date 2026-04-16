import { ShippingAddress } from "@/types";

export const REQUIRED_ADDRESS_FIELDS: Array<keyof ShippingAddress> = [
  "fullName",
  "street",
  "city",
  "province",
  "phone",
  "postalCode",
  "country",
];

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
