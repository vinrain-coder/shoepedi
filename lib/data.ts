import { Data, IProductInput, IUserInput, ICategoryInput, IBrandInput, ITagInput, ICouponInput, IBlogInput } from "@/types";
import { toSlug } from "./utils";
import bcrypt from "bcryptjs";

const categories: ICategoryInput[] = [
  {
    name: "Running Shoes",
    slug: "running-shoes",
    description: "High-performance running shoes for athletes and casual runners.",
    isFeatured: true,
    image: "/images/categories/running.jpg",
    seoTitle: "Best Running Shoes Online",
    seoDescription: "Shop the latest running shoes from top brands. Comfort and performance guaranteed.",
  },
  {
    name: "Basketball Shoes",
    slug: "basketball-shoes",
    description: "Pro-level basketball sneakers for the court.",
    isFeatured: true,
    image: "/images/categories/basketball.jpg",
    seoTitle: "Professional Basketball Shoes",
    seoDescription: "Dominate the court with our selection of basketball sneakers.",
  },
  {
    name: "Casual Sneakers",
    slug: "casual-sneakers",
    description: "Stylish and comfortable sneakers for everyday wear.",
    isFeatured: true,
    image: "/images/categories/casual.jpg",
    seoTitle: "Lifestyle & Casual Sneakers",
    seoDescription: "Find your perfect pair of casual sneakers for any occasion.",
  },
  {
    name: "Training & Gym",
    slug: "training-gym",
    description: "Versatile footwear for gym workouts and cross-training.",
    isFeatured: false,
    image: "/images/categories/training.jpg",
    seoTitle: "Training & Gym Footwear",
    seoDescription: "Supportive shoes for your most intense workout sessions.",
  },
];

const brands: IBrandInput[] = [
  {
    name: "Nike",
    slug: "nike",
    description: "Global leader in athletic footwear and apparel.",
    isFeatured: true,
    logo: "/images/brands/nike-logo.svg",
    image: "/images/brands/nike-banner.jpg",
  },
  {
    name: "Adidas",
    slug: "adidas",
    description: "Innovative sports brand with a rich heritage.",
    isFeatured: true,
    logo: "/images/brands/adidas-logo.svg",
    image: "/images/brands/adidas-banner.jpg",
  },
  {
    name: "Jordan",
    slug: "jordan",
    description: "Iconic basketball brand inspired by Michael Jordan.",
    isFeatured: true,
    logo: "/images/brands/jordan-logo.svg",
    image: "/images/brands/jordan-banner.jpg",
  },
  {
    name: "Puma",
    slug: "puma",
    description: "Fast-moving sports brand focused on performance and style.",
    isFeatured: false,
    logo: "/images/brands/puma-logo.svg",
    image: "/images/brands/puma-banner.jpg",
  },
];

const tags: ITagInput[] = [
  {
    name: "New Arrival",
    slug: "new-arrival",
    description: "The latest products added to our collection.",
    image: "/images/tags/new.jpg",
  },
  {
    name: "Best Seller",
    slug: "best-seller",
    description: "Our most popular and highly-rated products.",
    image: "/images/tags/popular.jpg",
  },
  {
    name: "Limited Edition",
    slug: "limited-edition",
    description: "Exclusive items with limited availability.",
    image: "/images/tags/limited.jpg",
  },
  {
    name: "Eco Friendly",
    slug: "eco-friendly",
    description: "Products made with sustainable materials.",
    image: "/images/tags/eco.jpg",
  },
];

const coupons: ICouponInput[] = [
  {
    code: "WELCOME10",
    discountType: "percentage" as any,
    discountValue: 10,
    minPurchase: 50,
    isActive: true,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    code: "SAVE20",
    discountType: "fixed" as any,
    discountValue: 20,
    minPurchase: 100,
    isActive: true,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  },
];

const blogs: IBlogInput[] = [
  {
    title: "How to Choose the Perfect Running Shoes",
    slug: "choose-perfect-running-shoes",
    content: "Detailed guide on selecting the right running shoes based on your foot type and running style...",
    image: "/images/blog/running-guide.jpg",
    category: "Guides",
    tags: ["running", "footwear", "health"],
    isPublished: true,
    publishedAt: new Date(),
    views: 120,
  },
  {
    title: "The Evolution of Air Jordan Sneakers",
    slug: "evolution-air-jordan",
    content: "A look back at the history and cultural impact of the Air Jordan line...",
    image: "/images/blog/jordan-history.jpg",
    category: "Culture",
    tags: ["jordan", "sneakerhead", "history"],
    isPublished: true,
    publishedAt: new Date(),
    views: 450,
  },
];

const users: IUserInput[] = [
  {
    name: "Admin User",
    email: "admin@shoepedi.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "ADMIN",
    emailVerified: true,
    paymentMethod: "Stripe",
    address: {
      fullName: "Admin Account",
      street: "123 Business Rd",
      city: "Nairobi",
      province: "Nairobi",
      postalCode: "00100",
      country: "Kenya",
      phone: "+254712345678",
    },
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: bcrypt.hashSync("user123", 10),
    role: "User",
    emailVerified: true,
    paymentMethod: "Mpesa",
    address: {
      fullName: "John Doe",
      street: "456 Resident Ave",
      city: "Mombasa",
      province: "Coast",
      postalCode: "80100",
      country: "Kenya",
      phone: "+254787654321",
    },
  },
];

const products: IProductInput[] = [
  {
    name: "Nike Air Zoom Pegasus 40",
    slug: toSlug("Nike Air Zoom Pegasus 40"),
    category: "Running Shoes",
    brand: "Nike",
    images: ["/images/products/pegasus-1.jpg", "/images/products/pegasus-2.jpg"],
    tags: ["new-arrival", "best-seller"],
    isPublished: true,
    price: 130.0,
    listPrice: 150.0,
    countInStock: 25,
    description: "The workhorse with wings returns. The Nike Air Zoom Pegasus 40 provides a responsive ride for any run.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black/White", "Blue/Volt", "Red/Crimson"],
    avgRating: 4.8,
    numReviews: 124,
    numSales: 320,
    ratingDistribution: [
      { rating: 1, count: 2 },
      { rating: 2, count: 3 },
      { rating: 3, count: 10 },
      { rating: 4, count: 25 },
      { rating: 5, count: 84 },
    ],
    reviews: [],
  },
  {
    name: "Adidas Ultraboost Light",
    slug: toSlug("Adidas Ultraboost Light"),
    category: "Running Shoes",
    brand: "Adidas",
    images: ["/images/products/ultraboost-1.jpg"],
    tags: ["eco-friendly"],
    isPublished: true,
    price: 190.0,
    listPrice: 190.0,
    countInStock: 15,
    description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever.",
    sizes: ["8", "9", "10", "11"],
    colors: ["Cloud White", "Core Black"],
    avgRating: 4.9,
    numReviews: 89,
    numSales: 150,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 5 },
      { rating: 4, count: 15 },
      { rating: 5, count: 68 },
    ],
    reviews: [],
  },
  {
    name: "Air Jordan 1 Retro High OG",
    slug: toSlug("Air Jordan 1 Retro High OG"),
    category: "Basketball Shoes",
    brand: "Jordan",
    images: ["/images/products/jordan1-1.jpg", "/images/products/jordan1-2.jpg"],
    tags: ["best-seller", "limited-edition"],
    isPublished: true,
    price: 180.0,
    listPrice: 180.0,
    countInStock: 5,
    description: "The sneaker that started it all. The Air Jordan 1 Retro High OG stays true to the original 1985 design.",
    sizes: ["9", "10", "11"],
    colors: ["Chicago", "Bred", "Royal"],
    avgRating: 5.0,
    numReviews: 210,
    numSales: 1200,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 18 },
      { rating: 5, count: 190 },
    ],
    reviews: [],
  },
];

const reviews = [
  {
    rating: 5,
    title: "Incredible Comfort",
    comment: "These are the most comfortable shoes I've ever owned. Worth every penny!",
  },
  {
    rating: 4,
    title: "Great performance",
    comment: "Solid grip and support. Slightly narrow fit but overall excellent.",
  },
];

const data: Data = {
  users,
  products,
  categories,
  brands,
  tags,
  coupons,
  blogs,
  reviews,
  webPages: [
    {
      title: "About Us",
      slug: "about-us",
      content: `Welcome to ShoePedi, your trusted destination for quality footwear and exceptional service. Our journey began with a mission to bring you the best shopping experience by offering a wide range of products at competitive prices, all in one convenient platform.

At ShoePedi, we prioritize customer satisfaction and innovation. Our team works tirelessly to curate a diverse selection of items, from everyday essentials to exclusive deals, ensuring there's something for everyone. We also strive to make your shopping experience seamless with fast shipping, secure payments, and excellent customer support.

As we continue to grow, our commitment to quality and service remains unwavering. Thank you for choosing ShoePedi—we look forward to being a part of your journey and delivering value every step of the way.`,
      isPublished: true,
    },
    {
      title: "Contact Us",
      slug: "contact-us",
      content: `We’re here to help! If you have any questions, concerns, or feedback, please don’t hesitate to reach out to us. Our team is ready to assist you and ensure you have the best shopping experience.

**Customer Support**
For inquiries about orders, products, or account-related issues, contact our customer support team:
- **Email:** support@shoepedi.com
- **Phone:** +254 700 000000
- **Live Chat:** Available on our website from 9 AM to 6 PM (Monday to Friday).

**Head Office**
For corporate or business-related inquiries, reach out to our headquarters:
- **Address:** 1234 Footwear St, Suite 567, Nairobi, Kenya

We look forward to assisting you! Your satisfaction is our priority.
`,
      isPublished: true,
    },
    {
      title: "Help",
      slug: "help",
      content: `Welcome to our Help Center! We're here to assist you with any questions or concerns you may have while shopping with us. Whether you need help with orders, account management, or product inquiries, this page provides all the information you need to navigate our platform with ease.

**Placing and Managing Orders**
Placing an order is simple and secure. Browse our product categories, add items to your cart, and proceed to checkout. Once your order is placed, you can track its status through your account under the "My Orders" section. If you need to modify or cancel your order, please contact us as soon as possible for assistance.

**Shipping and Returns**
We offer a variety of shipping options to suit your needs, including standard and express delivery. For detailed shipping costs and delivery timelines, visit our Shipping Policy page. If you're not satisfied with your purchase, our hassle-free return process allows you to initiate a return within the specified timeframe. Check our Returns Policy for more details.

**Account and Support**
Managing your account is easy. Sign in to update your personal information, payment methods, and saved addresses. If you encounter any issues or need further assistance, our customer support team is available via email, live chat, or phone. Visit our Contact Us page for support hours and contact details.`,
      isPublished: true,
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `We value your privacy and are committed to protecting your personal information. This Privacy Notice explains how we collect, use, and share your data when you interact with our services. By using our platform, you consent to the practices described herein.

We collect data such as your name, email address, and payment details to provide you with tailored services and improve your experience. This information may also be used for marketing purposes, but only with your consent. Additionally, we may share your data with trusted third-party providers to facilitate transactions or deliver products.

Your data is safeguarded through robust security measures to prevent unauthorized access. However, you have the right to access, correct, or delete your personal information at any time. For inquiries or concerns regarding your privacy, please contact our support team.`,
      isPublished: true,
    },
    {
      title: "Conditions of Use",
      slug: "conditions-of-use",
      content: `Welcome to ShoePedi. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our platform, including browsing, purchasing products, and interacting with any content or services provided. You must be at least 18 years old or have the consent of a parent or guardian to use this website. Any breach of these terms may result in the termination of your access to our platform.

We strive to ensure all product descriptions, pricing, and availability information on our website are accurate. However, errors may occur, and we reserve the right to correct them without prior notice. All purchases are subject to our return and refund policy. By using our site, you acknowledge that your personal information will be processed according to our privacy policy, ensuring your data is handled securely and responsibly. Please review these terms carefully before proceeding with any transactions.
`,
      isPublished: true,
    },
    {
      title: "Customer Service",
      slug: "customer-service",
      content: `At ShoePedi, our customer service team is here to ensure you have the best shopping experience. Whether you need assistance with orders, product details, or returns, we are committed to providing prompt and helpful support.

If you have questions or concerns, please reach out to us through our multiple contact options:
- **Email:** support@shoepedi.com
- **Phone:** +254 700 000000
- **Live Chat:** Available on our website for instant assistance

We also provide helpful resources such as order tracking, product guides, and FAQs to assist you with common inquiries. Your satisfaction is our priority, and we’re here to resolve any issues quickly and efficiently. Thank you for choosing us!`,
      isPublished: true,
    },
    {
      title: "Returns Policy",
      slug: "returns-policy",
      content: `Our goal is to ensure you are completely satisfied with your purchase. If you are not satisfied, you may return the item(s) within 14 days of receipt for a full refund or exchange, provided the items are in their original condition and packaging.

Please note that certain items, such as socks and insoles, are not eligible for return due to hygiene reasons. Shipping costs for returns are the responsibility of the customer unless the item is defective or incorrect. For more information, please contact our support team.`,
      isPublished: true,
    },
  ],
  headerMenus: [
    { name: "New Arrivals", href: "/search?tag=new-arrival" },
    { name: "Best Sellers", href: "/search?tag=best-seller" },
    { name: "Brands", href: "/brands" },
    { name: "Categories", href: "/categories" },
    { name: "Blog", href: "/blog" },
    { name: "Customer Service", href: "/page/customer-service" },
  ],
  carousels: [
    {
      title: "New Season Arrivals",
      buttonCaption: "Shop Collection",
      image: "/images/banners/hero-1.jpg",
      url: "/search?tag=new-arrival",
      isPublished: true,
    },
  ],
  settings: [
    {
      common: {
        freeShippingMinPrice: 5000,
        isMaintenanceMode: false,
        coinsRewardRate: 4,
        taxRate: 0,
        defaultTheme: "light",
        defaultColor: "gold",
        pageSize: 12,
      },
      site: {
        name: "ShoePedi",
        description: "Premium Footwear Store in Kenya",
        keywords: "sneakers, shoes, kenya, nike, adidas, jordan",
        url: "https://shoepedi.com",
        logo: "/icons/logo.svg",
        slogan: "Step into Excellence",
        author: "ShoePedi Team",
        copyright: "2024 ShoePedi Inc.",
        email: "support@shoepedi.com",
        address: "Nairobi, Kenya",
        phone: "+254 700 000000",
      },
      notifications: {
        sms: {
          enabled: true,
          sandboxMode: true,
          username: "sandbox",
          senderId: "SHOEPEDI",
          adminRecipients: "+254712345678",
        },
      },
      carousels: [
        {
          title: "Premium Running Gear",
          buttonCaption: "Explore",
          image: "/images/banners/hero-2.jpg",
          url: "/categories/running-shoes",
        },
      ],
      availableLanguages: [{ name: "English", code: "en-US" }],
      defaultLanguage: "en-US",
      availableCurrencies: [
        { name: "Kenyan Shilling", code: "KES", symbol: "KSh", convertRate: 1 },
        { name: "US Dollar", code: "USD", symbol: "$", convertRate: 0.0078 },
      ],
      defaultCurrency: "KES",
      availablePaymentMethods: [
        { name: "Mpesa", commission: 0 },
        { name: "Stripe", commission: 0 },
        { name: "Cash On Delivery", commission: 0 },
      ],
      defaultPaymentMethod: "Mpesa",
      availableDeliveryDates: [
        { name: "Standard", daysToDeliver: 3, shippingPrice: 300, freeShippingMinPrice: 5000 },
        { name: "Express", daysToDeliver: 1, shippingPrice: 600, freeShippingMinPrice: 10000 },
      ],
      defaultDeliveryDate: "Standard",
      deliveryCounties: [
        {
          county: "Nairobi",
          places: [
            { name: "CBD", rate: 120 },
            { name: "Westlands", rate: 180 },
            { name: "Karen", rate: 250 },
          ],
        },
        {
          county: "Mombasa",
          places: [
            { name: "Nyali", rate: 280 },
            { name: "Likoni", rate: 320 },
          ],
        },
      ],
      affiliate: {
        enabled: true,
        commissionRate: 10,
        defaultDiscountRate: 5,
        cookieExpiryDays: 30,
        minWithdrawalAmount: 1000,
      },
    },
  ],
};

export default data;
