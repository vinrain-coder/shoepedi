import { escapeRegExp } from "@/lib/utils";
import { buildCaseInsensitiveRegexFilter } from "./shared";

export const LOW_STOCK_THRESHOLD = 10;

export const buildDateFilter = (from?: string, to?: string) =>
  from || to
    ? {
        updatedAt: {
          ...(from ? { $gte: new Date(from) } : {}),
          ...(to
            ? {
                $lte: (() => {
                  const d = new Date(to);
                  d.setHours(23, 59, 59, 999);
                  return d;
                })(),
              }
            : {}),
        },
      }
    : {};

export const buildAdminBaseFilters = (params: {
  query?: string;
  category?: string;
  brand?: string;
  tag?: string;
  gender?: string;
  from?: string;
  to?: string;
}) => ({
  ...buildCaseInsensitiveRegexFilter("name", params.query, false),
  ...buildCaseInsensitiveRegexFilter("category", params.category),
  ...buildCaseInsensitiveRegexFilter("brand", params.brand),
  ...(params.tag && params.tag !== "all"
    ? { tags: { $regex: new RegExp(`^${escapeRegExp(params.tag)}$`, "i") } }
    : {}),
  ...buildCaseInsensitiveRegexFilter("gender", params.gender),
  ...buildDateFilter(params.from, params.to),
});
