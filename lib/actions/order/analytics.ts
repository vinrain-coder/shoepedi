"use server";

import { cacheLife } from "next/cache";
import { connectToDatabase } from "../../db";
import { DateRange } from "react-day-picker";
import Order from "../../db/models/order.model";
import Product from "../../db/models/product.model";
import User from "../../db/models/user.model";
import Review from "../../db/models/review.model";
import NewsletterSubscription from "../../db/models/newsletter-subscription.model";
import SupportTicket from "../../db/models/support-ticket.model";
import { getSetting } from "../setting.actions";
import { IOrderList } from "@/types";

export async function getOrderSummary(date: DateRange) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const query = {
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  };

  const [
    ordersCount,
    productsCount,
    usersCount,
    reviewsCount,
    newslettersCount,
    ticketsCount,
  ] = await Promise.all([
    Order.countDocuments(query),
    Product.countDocuments(query),
    User.countDocuments(query),
    Review.countDocuments(query),
    NewsletterSubscription.countDocuments({
      ...query,
      status: "subscribed",
    }),
    SupportTicket.countDocuments({ status: "open" }),
  ]);

  const totalSalesResult = await Order.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
    { $project: { totalSales: { $ifNull: ["$sales", 0] } } },
  ]);
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0;

  const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

  const orderStatusDistribution = await Order.aggregate([
    { $match: query },
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $project: { name: "$_id", value: 1, _id: 0 } },
  ]);

  const today = new Date();
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1,
  );
  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: sixMonthEarlierDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        label: "$_id",
        value: "$totalSales",
      },
    },

    { $sort: { label: 1 } },
  ]);
  const topSalesCategories = await getTopSalesCategories(date);
  const topSalesProducts = await getTopSalesProducts(date);

  const {
    common: { pageSize },
  } = await getSetting();
  const limit = pageSize;
  const latestOrders = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .limit(limit);

  const latestReviews = await Review.find()
    .sort({ createdAt: "desc" })
    .limit(5)
    .populate("user", "name")
    .populate("product", "name");

  const latestSubscribers = await NewsletterSubscription.find()
    .sort({ subscribedAt: "desc" })
    .limit(5)
    .lean();

  return {
    ordersCount,
    productsCount,
    usersCount,
    reviewsCount,
    newslettersCount,
    ticketsCount,
    totalSales,
    avgOrderValue,
    orderStatusDistribution: JSON.parse(JSON.stringify(orderStatusDistribution)),
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
    topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList[],
    latestReviews: JSON.parse(JSON.stringify(latestReviews)),
    latestSubscribers: JSON.parse(JSON.stringify(latestSubscribers)),
  };
}

async function getSalesChartData(date: DateRange) {
  "use cache";
  cacheLife("hours");
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $concat: [
            { $toString: "$_id.year" },
            "/",
            { $toString: "$_id.month" },
            "/",
            { $toString: "$_id.day" },
          ],
        },
        totalSales: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  return result;
}

async function getTopSalesProducts(date: DateRange) {
  "use cache";
  cacheLife("hours");
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: "$items" },

    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: {
          name: "$items.name",
          image: "$items.image",
          _id: "$items.product",
        },
        totalSales: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        }, // Assume quantity field in orderItems represents units sold
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
    { $limit: 6 },

    // Step 3: Replace productInfo array with product name and format the output
    {
      $project: {
        _id: 0,
        id: "$_id._id",
        label: "$_id.name",
        image: "$_id.image",
        value: "$totalSales",
      },
    },

    // Step 4: Sort by totalSales in descending order
    { $sort: { _id: 1 } },
  ]);

  return result;
}

async function getTopSalesCategories(date: DateRange, limit = 5) {
  "use cache";
  cacheLife("hours");
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: "$items" },
    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: "$items.category",
        totalSales: { $sum: "$items.quantity" }, // Assume quantity field in orderItems represents units sold
      },
    },
    // Step 3: Sort by totalSales in descending order
    { $sort: { totalSales: -1 } },
    // Step 4: Limit to top N products
    { $limit: limit },
  ]);

  return result;
}
