import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import qs from "query-string";

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : int;
};
// PROMPT: [ChatGTP] create toSlug ts arrow function that convert text to lowercase, remove non-word,
// non-whitespace, non-hyphen characters, replace whitespace, trim leading hyphens and trim trailing hyphens

export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "KES",
  style: "currency",
  minimumFractionDigits: 2,
});
export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount);
}

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");
export function formatNumber(number: number | string) {
  return COUNT_FORMATTER.format(Number(number));
}

const NUMBER_FORMATTER_TWO_DECIMALS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function formatNumberWithTwoDecimals(number: number | string) {
  return NUMBER_FORMATTER_TWO_DECIMALS.format(Number(number));
}

export const round2 = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const generateId = () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join("");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatError = (error: any): string => {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const errorMessage = error.errors[field].message;
      return `${error.errors[field].path}: ${errorMessage}`; // field: errorMessage
    });
    return fieldErrors.join(". ");
  } else if (error.name === "ValidationError") {
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const errorMessage = error.errors[field].message;
      return errorMessage;
    });
    return fieldErrors.join(". ");
  } else if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue)[0];
    return `${duplicateField} already exists`;
  } else {
    // return 'Something went wrong. please try again'
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
};

export function calculateFutureDate(days: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}
export function getMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1);
  const monthName = date.toLocaleString("default", { month: "long", timeZone: "Africa/Nairobi" });

  const nairobiParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  const nairobiYear = parseInt(nairobiParts.find((p) => p.type === "year")!.value, 10);
  const nairobiMonth = parseInt(nairobiParts.find((p) => p.type === "month")!.value, 10);

  if (year === nairobiYear && month === nairobiMonth) {
    return `${monthName} Ongoing`;
  }
  return monthName;
}
export function calculatePastDate(days: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  return currentDate;
}
export function timeUntilMidnight(): { hours: number; minutes: number } {
  const nairobiParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const getValue = (type: string) => parseInt(nairobiParts.find((p) => p.type === type)!.value, 10);

  const year = getValue("year");
  const month = getValue("month");
  const day = getValue("day");
  const hour = getValue("hour");
  const minute = getValue("minute");
  const second = getValue("second");

  const nowNairobi = new Date(year, month - 1, day, hour, minute, second);
  const midnightNairobi = new Date(year, month - 1, day + 1, 0, 0, 0);

  const diff = midnightNairobi.getTime() - nowNairobi.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export const formatDateTime = (dateInput: Date | string | number) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: "Africa/Nairobi",
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    // weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
    timeZone: "Africa/Nairobi",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: "Africa/Nairobi",
  };
  const parsedDate = new Date(dateInput);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      dateTime: "-",
      dateOnly: "-",
      timeOnly: "-",
    };
  }

  const formattedDateTime: string = parsedDate.toLocaleString("en-US", dateTimeOptions);
  const formattedDate: string = parsedDate.toLocaleString("en-US", dateOptions);
  const formattedTime: string = parsedDate.toLocaleString("en-US", timeOptions);
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function escapeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const getFilterUrl = ({
  params,
  category,
  tag,
  sort,
  price,
  rating,
  page,
  basePath = "/search",
}: {
  params: {
    q?: string;
    category?: string;
    tag?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
    brand?: string;
    gender?: string;
    color?: string;
    size?: string;
  };
  tag?: string;
  category?: string;
  sort?: string;
  price?: string;
  rating?: string;
  page?: string;
  basePath?: string;
}) => {
  const newParams = { ...params };
  if (category) newParams.category = category;
  if (tag) newParams.tag = toSlug(tag);
  if (price) newParams.price = price;
  if (rating) newParams.rating = rating;
  if (page) newParams.page = page;
  if (sort) newParams.sort = sort;

  return `${basePath}?${new URLSearchParams(newParams).toString()}`;
};

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

/**
 * Normalizes date boundaries for filtering.
 * @param from - Start date string.
 * @param to - End date string.
 * @returns An object with normalized UTC Dates or nulls.
 */
export function normalizeDateRange(from?: string, to?: string) {
  const res: { fromDate: Date | null; toDate: Date | null } = {
    fromDate: null,
    toDate: null,
  };

  if (from) {
    const d = new Date(from);
    if (!isNaN(d.getTime())) {
      res.fromDate = d;
    }
  }

  if (to) {
    const d = new Date(to);
    if (!isNaN(d.getTime())) {
      // Set to 23:59:59.999 UTC
      d.setUTCHours(23, 59, 59, 999);
      res.toDate = d;
    }
  }

  return res;
}