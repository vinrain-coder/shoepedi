import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { IUserSignUp } from "@/types";
import { UserSignUpSchema } from "@/lib/validator";
import { formatError } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import { sendAdminEventNotification, sendWelcomeNewUserEmail } from "@/lib/email/transactional";
import { connectToDatabase, User } from "./shared";

export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync(userSignUp);
    await connectToDatabase();

    const newUser = await User.create({ ...user, password: await bcrypt.hash(user.password, 5) });

    if (newUser) {
      await sendAdminEventNotification({
        title: "New customer account",
        description: `${newUser.name || newUser.email} created an account${newUser.email ? ` with ${newUser.email}` : ""}.`,
        href: "/admin/users",
        meta: "Needs verification",
        createdAt: new Date().toISOString(),
      });

      try {
        await sendWelcomeNewUserEmail({ email: newUser.email, name: newUser.name });
      } catch (error) {
        console.error("Non-critical: Failed to send welcome email:", error);
      }
    }

    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

export async function createUserByAdmin(userData: IUserSignUp & { role?: "ADMIN" | "USER" }) {
  try {
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const user = await UserSignUpSchema.parseAsync(userData);
    await connectToDatabase();

    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) throw new Error("Email already exists");

    const newUser = await User.create({
      ...user,
      role: userData.role || "USER",
      password: await bcrypt.hash(user.password, 5),
    });

    if (newUser && newUser.role !== "ADMIN") {
      await sendAdminEventNotification({
        title: "New account created by admin",
        description: `Admin ${session.user.name} created an account for ${newUser.name || newUser.email}.`,
        href: "/admin/users",
        createdAt: new Date().toISOString(),
      });

      try {
        await sendWelcomeNewUserEmail({ email: newUser.email, name: newUser.name });
      } catch (error) {
        console.error("Non-critical: Failed to send welcome email:", error);
      }
    }

    revalidatePath("/admin/users");
    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
