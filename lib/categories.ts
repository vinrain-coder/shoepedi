export interface CategorySeed {
  name: string
  slug: string
  description?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  subcategories?: CategorySeed[] // recursive
}

export const categoriesData: CategorySeed[]  = [
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
        subcategories: [
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
        subcategories: [
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
      {
        name: "TV & Home Entertainment",
        slug: "tv-home-entertainment",
        seoTitle: "TV & Home Entertainment",
        seoDescription:
          "LED, Smart TVs, sound systems, and home entertainment.",
        seoKeywords: ["TV", "home entertainment", "sound systems"],
        subcategories: [
          {
            name: "Smart TVs",
            slug: "smart-tvs",
            seoTitle: "Smart TVs",
            seoDescription: "Shop Smart TVs.",
            seoKeywords: ["smart tvs"],
          },
          {
            name: "Sound Systems",
            slug: "sound-systems",
            seoTitle: "Sound Systems",
            seoDescription: "Buy sound systems online.",
            seoKeywords: ["sound systems"],
          },
        ],
      },
      {
        name: "Cameras",
        slug: "cameras",
        seoTitle: "Cameras",
        seoDescription: "DSLR, mirrorless, and compact cameras.",
        seoKeywords: ["cameras", "DSLR", "mirrorless", "compact cameras"],
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
        subcategories: [
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
          {
            name: "Pants",
            slug: "men-pants",
            seoTitle: "Men's Pants",
            seoDescription: "Shop men’s pants.",
            seoKeywords: ["pants", "men"],
          },
        ],
      },
      {
        name: "Women",
        slug: "women-fashion",
        seoTitle: "Women's Fashion",
        seoDescription: "Shop women’s clothing and accessories.",
        seoKeywords: ["women", "fashion", "clothing", "accessories"],
        subcategories: [
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
          {
            name: "Skirts",
            slug: "women-skirts",
            seoTitle: "Women's Skirts",
            seoDescription: "Shop skirts online.",
            seoKeywords: ["skirts", "women"],
          },
        ],
      },
      {
        name: "Shoes",
        slug: "fashion-shoes",
        seoTitle: "Shoes",
        seoDescription: "Men and women's shoes.",
        seoKeywords: ["shoes", "fashion shoes", "men shoes", "women shoes"],
        subcategories: [
          {
            name: "Men Shoes",
            slug: "men-shoes",
            seoTitle: "Men's Shoes",
            seoDescription: "Shop men's shoes online.",
            seoKeywords: ["men shoes"],
          },
          {
            name: "Women Shoes",
            slug: "women-shoes",
            seoTitle: "Women's Shoes",
            seoDescription: "Shop women's shoes online.",
            seoKeywords: ["women shoes"],
          },
        ],
      },
    ],
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    seoTitle: "Beauty & Health Products",
    seoDescription: "Skincare, makeup, personal care and health products.",
    seoKeywords: ["beauty", "health", "skincare", "makeup", "personal care"],
    subcategories: [
      {
        name: "Skincare",
        slug: "skincare",
        seoTitle: "Skincare",
        seoDescription: "Skincare products online.",
        seoKeywords: ["skincare"],
      },
      {
        name: "Makeup",
        slug: "makeup",
        seoTitle: "Makeup",
        seoDescription: "Buy makeup products online.",
        seoKeywords: ["makeup"],
      },
      {
        name: "Personal Care",
        slug: "personal-care",
        seoTitle: "Personal Care",
        seoDescription: "Hygiene and care products.",
        seoKeywords: ["personal care"],
      },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    seoTitle: "Home & Kitchen Products",
    seoDescription: "Furniture, appliances, and kitchen essentials.",
    seoKeywords: ["home", "kitchen", "furniture", "appliances"],
    subcategories: [
      {
        name: "Furniture",
        slug: "furniture",
        seoTitle: "Furniture",
        seoDescription: "Shop furniture online.",
        seoKeywords: ["furniture"],
      },
      {
        name: "Appliances",
        slug: "appliances",
        seoTitle: "Appliances",
        seoDescription: "Buy home appliances online.",
        seoKeywords: ["appliances"],
      },
      {
        name: "Kitchen Essentials",
        slug: "kitchen-essentials",
        seoTitle: "Kitchen Essentials",
        seoDescription: "Kitchenware and essentials.",
        seoKeywords: ["kitchen essentials"],
      },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    seoTitle: "Sports & Outdoor Gear",
    seoDescription: "Sports equipment, outdoor gear, and apparel.",
    seoKeywords: ["sports", "outdoors", "equipment", "apparel"],
    subcategories: [
      {
        name: "Equipment",
        slug: "sports-equipment",
        seoTitle: "Sports Equipment",
        seoDescription: "All sports equipment online.",
        seoKeywords: ["sports equipment"],
      },
      {
        name: "Apparel",
        slug: "sports-apparel",
        seoTitle: "Sports Apparel",
        seoDescription: "Sportswear and apparel online.",
        seoKeywords: ["sports apparel"],
      },
    ],
  },
];
