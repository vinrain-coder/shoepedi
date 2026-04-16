import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Types } from "mongoose";
import { IUserName } from "@/types";
import { UserUpdateSchema } from "@/lib/validator";
import { formatError } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import { connectToDatabase, Order, User } from "./shared";

export async function deleteUser(id: string) {
  try {
    await connectToDatabase();
    const res = await User.findByIdAndDelete(id);
    if (!res) throw new Error("Use not found");
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) throw new Error("User not found");

    dbUser.name = user.name;
    dbUser.email = user.email;
    dbUser.role = user.role;

    const updatedUser = await dbUser.save();
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    const currentUser = await User.findById(session?.user?.id);
    if (!currentUser) throw new Error("User not found");

    currentUser.name = user.name;
    const updatedUser = await currentUser.save();

    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function convertGuestToUser(orderId: string, accessToken: string) {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ _id: orderId, isGuest: true, accessToken });
    if (!order) throw new Error("Order not found or already linked");

    const session = await getServerSession();
    if (!session?.user?.id || !session?.user?.email) throw new Error("You must be signed in to link an order");

    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    const orderEmail = order.userEmail?.toLowerCase() || order.shippingAddress.email?.toLowerCase();
    if (orderEmail && session.user.email.toLowerCase() !== orderEmail) {
      throw new Error("Signed-in email does not match order email");
    }

    order.user = new Types.ObjectId(session.user.id);
    order.isGuest = false;
    order.accessToken = undefined;

    if (order.isPaid && order.coinsEarned > 0 && !order.coinsCredited) {
      user.coins = (user.coins || 0) + order.coinsEarned;
      order.coinsCredited = true;
    }

    await order.save();

    if (user.addresses.length === 0) {
      user.addresses.push({
        id: new Types.ObjectId().toString(),
        label: "Home",
        ...order.shippingAddress,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await user.save();
    revalidatePath(`/account/orders/${orderId}`);

    return { success: true, message: "Order successfully linked to your account" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
