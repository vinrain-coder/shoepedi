export interface MinicategorySeed {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface SubcategorySeed {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  minicategories?: MinicategorySeed[];
}

export interface CategorySeed {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  subcategories?: SubcategorySeed[];
}

export const categoriesData: CategorySeed[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description:
      "Latest electronics including phones, laptops, TVs, and gadgets.",
    seoTitle: "Buy Electronics Online - Best Deals",
    seoDescription:
      "Shop top electronics like smartphones, laptops, TVs, and gadgets online.",
    seoKeywords: ["electronics", "smartphones", "laptops", "TVs", "gadgets"],
    subcategories: [
      {
        name: "Phones",
        slug: "phones",
        description: "Smartphones from top brands.",
        seoTitle: "Buy Smartphones Online",
        seoDescription: "Shop Android and iPhone smartphones online.",
        seoKeywords: ["phones", "android", "iphone", "smartphones"],
        minicategories: [
          {
            name: "Android",
            slug: "android",
            seoTitle: "Android Phones",
            seoDescription: "Shop Android smartphones.",
            seoKeywords: ["android", "phones"],
          },
          {
            name: "iPhone",
            slug: "iphone",
            seoTitle: "iPhone Phones",
            seoDescription: "Shop iPhones online.",
            seoKeywords: ["iphone", "smartphones"],
          },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        description: "Gaming, ultrabook, and business laptops.",
        seoTitle: "Buy Laptops Online",
        seoDescription: "Shop gaming, ultrabook, and business laptops.",
        seoKeywords: [
          "laptops",
          "gaming laptops",
          "ultrabooks",
          "business laptops",
        ],
        minicategories: [
          {
            name: "Gaming",
            slug: "gaming-laptops",
            seoTitle: "Gaming Laptops",
            seoDescription: "Best gaming laptops.",
            seoKeywords: ["gaming laptops"],
          },
          {
            name: "Ultrabooks",
            slug: "ultrabooks",
            seoTitle: "Ultrabooks",
            seoDescription: "Thin and light ultrabooks.",
            seoKeywords: ["ultrabooks"],
          },
          {
            name: "Business",
            slug: "business-laptops",
            seoTitle: "Business Laptops",
            seoDescription: "Laptops for work and office.",
            seoKeywords: ["business laptops"],
          },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, footwear, and accessories for men and women.",
    seoTitle: "Shop Fashion Online",
    seoDescription: "Latest fashion trends for men and women.",
    seoKeywords: ["fashion", "clothing", "shoes", "accessories"],
    subcategories: [
      {
        name: "Men",
        slug: "men-fashion",
        seoTitle: "Men's Fashion",
        seoDescription: "Shop men’s clothing and accessories.",
        seoKeywords: ["men", "fashion", "clothing", "accessories"],
        minicategories: [
          {
            name: "Shirts",
            slug: "men-shirts",
            seoTitle: "Men's Shirts",
            seoDescription: "Buy stylish men's shirts.",
            seoKeywords: ["shirts", "men"],
          },
          {
            name: "Jackets",
            slug: "men-jackets",
            seoTitle: "Men's Jackets",
            seoDescription: "Buy men's jackets online.",
            seoKeywords: ["jackets", "men"],
          },
        ],
      },
      {
        name: "Women",
        slug: "women-fashion",
        seoTitle: "Women's Fashion",
        seoDescription: "Shop women’s clothing and accessories.",
        seoKeywords: ["women", "fashion", "clothing", "accessories"],
        minicategories: [
          {
            name: "Dresses",
            slug: "women-dresses",
            seoTitle: "Women's Dresses",
            seoDescription: "Buy stylish women's dresses.",
            seoKeywords: ["dresses", "women"],
          },
          {
            name: "Tops",
            slug: "women-tops",
            seoTitle: "Women's Tops",
            seoDescription: "Shop women's tops online.",
            seoKeywords: ["tops", "women"],
          },
        ],
      },
    ],
  },
];
