import { getServerSession } from "@/lib/get-session";
import { connectToDatabase, User } from "./shared";

export async function getUserCoins(): Promise<number | null> {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session?.user?.id) return null;

    const user = await User.findById(session.user.id).select("coins").lean();
    if (!user) return null;

    return Number(Number(user.coins || 0).toFixed(2));
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return null;
  }
}
