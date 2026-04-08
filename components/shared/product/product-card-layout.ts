export const PRODUCT_CARD_LAYOUTS = ["classic", "split"] as const;

export type ProductCardLayout = (typeof PRODUCT_CARD_LAYOUTS)[number];

export const DEFAULT_PRODUCT_CARD_LAYOUT: ProductCardLayout = "classic";

export const isProductCardLayout = (value: string): value is ProductCardLayout =>
  PRODUCT_CARD_LAYOUTS.includes(value as ProductCardLayout);
