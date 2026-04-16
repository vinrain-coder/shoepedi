import { IUser } from "@/lib/db/models/user.model";
import { getSetting } from "@/lib/actions/setting.actions";
import { escapeRegExp } from "@/lib/utils";
import { connectToDatabase, User } from "./shared";

export async function getAllUsers({
  limit,
  page,
  search,
  role,
}: {
  limit?: number;
  page: number;
  search?: string;
  role?: string;
}) {
  const {
    common: { pageSize },
  } = await getSetting();

  const pageLimit = limit || pageSize;
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (search) {
    const escapedSearch = escapeRegExp(search);
    query.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  if (role && role !== "all") query.role = role;

  const skipAmount = (Number(page) - 1) * pageLimit;
  const users = await User.find(query).sort({ createdAt: "desc" }).skip(skipAmount).limit(pageLimit);
  const usersCount = await User.countDocuments(query);

  return {
    data: JSON.parse(JSON.stringify(users)) as IUser[],
    totalPages: Math.ceil(usersCount / pageLimit),
    totalUsers: usersCount,
  };
}

export async function getUserStats() {
  await connectToDatabase();

  const [totalUsers, adminCount, customerCount, recentUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "ADMIN" }),
    User.countDocuments({ role: "USER" }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  return { totalUsers, adminCount, customerCount, recentUsers };
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return JSON.parse(JSON.stringify(user)) as IUser;
}
