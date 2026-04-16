import { Types } from "mongoose";
import { connectToDatabase, Order, Product, User } from "./shared";

export async function getAdminUserInsights(userId: string) {
  await connectToDatabase();

  const user = await User.findById(userId)
    .select("name email role createdAt wishlist coins navigationHistory")
    .lean();
  if (!user) throw new Error("User not found");

  const wishlistIds = (Array.isArray(user.wishlist) ? user.wishlist : [])
    .map((id) => String(id))
    .filter((id) => Types.ObjectId.isValid(id));

  const [wishlistProducts, orders, orderStats] = await Promise.all([
    wishlistIds.length
      ? Product.find({ _id: { $in: wishlistIds } })
          .select("name slug images category price isPublished")
          .sort({ updatedAt: -1 })
          .limit(12)
          .lean()
      : [],
    Order.find({ user: user._id })
      .select("_id createdAt totalPrice status isPaid isDelivered items")
      .sort({ createdAt: -1 })
      .limit(15)
      .lean(),
    Order.aggregate([
      { $match: { user: user._id } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: "$totalPrice" },
                avgOrderValue: { $avg: "$totalPrice" },
                paidOrders: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] } },
                deliveredOrders: { $sum: { $cond: [{ $eq: ["$isDelivered", true] }, 1, 0] } },
              },
            },
          ],
          monthlyOrders: [
            {
              $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                orders: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]),
  ]);

  const stats = orderStats?.[0];
  const totals = stats?.totals?.[0] ?? {
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    paidOrders: 0,
    deliveredOrders: 0,
  };

  const monthlyOrders = (stats?.monthlyOrders ?? []).map(
    (item: { _id: { year: number; month: number }; orders: number }) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      orders: item.orders,
    }),
  );

  const navigationHistory = (user.navigationHistory ?? [])
    .sort((a, b) => new Date(String(b.visitedAt)).getTime() - new Date(String(a.visitedAt)).getTime())
    .slice(0, 15);

  return JSON.parse(
    JSON.stringify({
      user: { ...user, wishlist: wishlistProducts },
      metrics: { ...totals, wishlistCount: wishlistIds.length },
      monthlyOrders,
      recentOrders: orders,
      navigationHistory,
    }),
  );
}
