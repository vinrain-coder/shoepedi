import { cacheTag } from "next/cache";
import { cacheLife } from "next/cache";
import { escapeRegExp } from "@/lib/utils";
import { productRepo } from "@/lib/server/repositories/product.repo";

export const { connectToDatabase, Product } = productRepo;

export const enableProductsCache = () => {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
};

export const toTitleCase = (value: string) =>
  value
    .split(/\s+|-/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();

export const buildCaseInsensitiveRegexFilter = (
  key: string,
  value?: string,
  exact = true,
) => {
  if (!value || value === "all") return {};

  const regexValue = exact
    ? `^${escapeRegExp(value)}$`
    : escapeRegExp(value);

  return {
    [key]: {
      $regex: regexValue,
      $options: "i",
    },
  };
};

export const buildArrayRegexFilter = (key: string, value?: string) => {
  if (!value || value === "all") return {};

  return {
    [key]: {
      $elemMatch: {
        $regex: `^${escapeRegExp(value)}$`,
        $options: "i",
      },
    },
  };
};

export const resolveSortOrder = (sort?: string): Record<string, 1 | -1> =>
  sort === "best-selling"
    ? { numSales: -1 }
    : sort === "price-low-to-high"
      ? { price: 1 }
      : sort === "price-high-to-low"
        ? { price: -1 }
        : sort === "avg-customer-review"
          ? { avgRating: -1 }
          : { _id: -1 };
