"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/emails";
import { connectToDatabase } from "../db";
import User from "../db/models/user.model";
import PasswordResetToken from "../db/models/reset-password-token.model";

// ✅ Request Password Reset
export async function requestPasswordReset(email: string) {
  await connectToDatabase();

  const emailSchema = z.string().email("Invalid email address");
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { error: "Invalid email format" };
  }

  const user = await User.findOne({ email });
  if (!user) return { error: "Email not found" };

  await PasswordResetToken.deleteMany({ user: user._id });

  const token = crypto.randomBytes(32).toString("hex");

  await PasswordResetToken.create({
    user: user._id,
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  await sendPasswordResetEmail(user.email, token);

  return { success: "Password reset email sent!" };
}

// ✅ Reset Password
export async function resetPassword(token: string, newPassword: string) {
  await connectToDatabase();

  const resetToken = await PasswordResetToken.findOne({ token });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "Invalid or expired reset token" };
  }

  const user = await User.findById(resetToken.user);
  if (!user) return { error: "User not found" };

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await PasswordResetToken.deleteOne({ token });

  return { success: "Password has been reset successfully!" };
}
