import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/db/models/order.model";
import Product from "@/lib/db/models/product.model";
import User from "@/lib/db/models/user.model";
import Review from "@/lib/db/models/review.model";
import NewsletterSubscription from "@/lib/db/models/newsletter-subscription.model";
import SupportTicket from "@/lib/db/models/support-ticket.model";
import Affiliate from "@/lib/db/models/affiliate.model";
import AffiliateEarning from "@/lib/db/models/affiliate-earning.model";
import DeliveryLocation from "@/lib/db/models/delivery-location.model";

export const orderRepo = {
  connectToDatabase,
  Order,
  Product,
  User,
  Review,
  NewsletterSubscription,
  SupportTicket,
  Affiliate,
  AffiliateEarning,
  DeliveryLocation,
};
