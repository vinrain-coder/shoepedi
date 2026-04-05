"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import Affiliate, { IAffiliate } from "../db/models/affiliate.model";
import AffiliateEarning from "../db/models/affiliate-earning.model";
import AffiliatePayout from "../db/models/affiliate-payout.model";
import { AffiliateInputSchema, AffiliatePayoutInputSchema } from "../validator";
import { formatError } from "../utils";
import { getServerSession } from "../get-session";
import { getSetting } from "./setting.actions";
import {
  sendAdminEventNotification,
  sendAffiliateApprovalNotification,
  sendAffiliatePayoutNotification,
} from "@/lib/email/transactional";
import { formatCurrency } from "../utils";

export async function registerAffiliate(data: any) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const validatedData = AffiliateInputSchema.parse(data);

    const existingAffiliate = await Affiliate.findOne({
      $or: [{ user: session.user.id }, { affiliateCode: validatedData.affiliateCode }],
    });

    if (existingAffiliate) {
      if (existingAffiliate.user.toString() === session.user.id) {
        throw new Error("You are already registered as an affiliate");
      }
      throw new Error("Affiliate code is already taken");
    }

    const affiliate = await Affiliate.create({
      user: session.user.id,
      affiliateCode: validatedData.affiliateCode.trim().toUpperCase(),
      paymentDetails: validatedData.paymentDetails,
      status: "pending",
    });

    await sendAdminEventNotification({
      title: "New affiliate application",
      description: `${session.user.name || "A user"} applied to be an affiliate (Code: ${affiliate.affiliateCode}).`,
      href: "/admin/affiliates",
      meta: "Application pending",
      createdAt: affiliate.createdAt.toISOString(),
    });

    revalidatePath("/affiliate/dashboard");
    return { success: true, message: "Application submitted successfully", data: JSON.parse(JSON.stringify(affiliate)) };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAffiliateDashboardData(params?: { payoutPage?: number; payoutLimit?: number }) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const affiliate = await Affiliate.findOne({ user: session.user.id });
    if (!affiliate) return { success: false, message: "Affiliate profile not found" };

    const earnings = await AffiliateEarning.find({ affiliate: affiliate._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("order", "trackingNumber totalPrice status");

    const payoutPage = params?.payoutPage || 1;
    const payoutLimit = params?.payoutLimit || 10;
    const skipPayouts = (payoutPage - 1) * payoutLimit;

    const payouts = await AffiliatePayout.find({ affiliate: affiliate._id })
      .sort({ createdAt: -1 })
      .skip(skipPayouts)
      .limit(payoutLimit);

    const totalPayouts = await AffiliatePayout.countDocuments({ affiliate: affiliate._id });

    return {
      success: true,
      data: {
        affiliate: JSON.parse(JSON.stringify(affiliate)),
        recentEarnings: JSON.parse(JSON.stringify(earnings)),
        recentPayouts: JSON.parse(JSON.stringify(payouts)),
        payoutTotalPages: Math.ceil(totalPayouts / payoutLimit),
      },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAffiliateByCode(code: string) {
  await connectToDatabase();
  return await Affiliate.findOne({ affiliateCode: code, status: "approved" });
}

export async function isApprovedAffiliate() {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) return false;

    const affiliate = await Affiliate.findOne({ user: session.user.id });
    return affiliate?.status === "approved";
  } catch (error) {
    console.error("Error checking affiliate status:", error);
    return false;
  }
}

export async function getAffiliateStatus() {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) return { exists: false };

    const affiliate = await Affiliate.findOne({ user: session.user.id });
    if (!affiliate) return { exists: false };

    return {
      exists: true,
      status: affiliate.status,
    };
  } catch (error) {
    console.error("Error getting affiliate status:", error);
    return { exists: false };
  }
}

export async function createPayoutRequest(data: any) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const affiliate = await Affiliate.findOne({ user: session.user.id });
    if (!affiliate || affiliate.status !== "approved") {
      throw new Error("Only approved affiliates can request payouts");
    }

    const { affiliate: settings } = await getSetting();
    const validatedData = AffiliatePayoutInputSchema.parse(data);

    if (validatedData.amount < settings.minWithdrawalAmount) {
      throw new Error(`Minimum withdrawal amount is ${settings.minWithdrawalAmount}`);
    }

    if (validatedData.amount > affiliate.earningsBalance) {
      throw new Error("Insufficient balance");
    }

    const payout = await AffiliatePayout.create({
      affiliate: affiliate._id,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      paymentDetails: validatedData.paymentDetails,
      status: "pending",
    });

    // Deduct from balance immediately to prevent double withdrawal
    affiliate.earningsBalance -= validatedData.amount;
    await affiliate.save();

    await sendAdminEventNotification({
      title: "New payout request",
      description: `${session.user.name || "An affiliate"} requested a payout of ${formatCurrency(payout.amount)} via ${payout.paymentMethod}.`,
      href: "/admin/payouts",
      meta: "Payout pending",
      createdAt: payout.createdAt.toISOString(),
    });

    revalidatePath("/affiliate/payouts");
    return { success: true, message: "Payout request submitted", data: JSON.parse(JSON.stringify(payout)) };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Admin Actions
export async function getAllAffiliates({ page = 1, limit = 20, status }: { page?: number, limit?: number, status?: string }) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const query = status ? { status } : {};
    const affiliates = await Affiliate.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Affiliate.countDocuments(query);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(affiliates)),
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateAffiliateStatus(id: string, status: "approved" | "rejected", adminNote?: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const update: any = { status };
    if (status === "rejected" && adminNote) update.adminNote = adminNote;

    const affiliate = await Affiliate.findByIdAndUpdate(id, update, { new: true }).populate("user", "name email");
    if (!affiliate) throw new Error("Affiliate not found");

    if (status === "approved") {
      const user = affiliate.user as unknown as { email: string; name: string; addresses?: any[] };
      const phone = user.addresses?.[0]?.phone;
      await sendAffiliateApprovalNotification({
        email: user.email,
        name: user.name,
        affiliateCode: affiliate.affiliateCode,
        phone,
      });
    }

    revalidatePath("/admin/affiliates");
    return { success: true, message: `Affiliate ${status}`, data: JSON.parse(JSON.stringify(affiliate)) };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllPayouts({ page = 1, limit = 20, status }: { page?: number, limit?: number, status?: string }) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const query = status ? { status } : {};
    const payouts = await AffiliatePayout.find(query)
      .populate({
        path: "affiliate",
        populate: { path: "user", select: "name email" }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await AffiliatePayout.countDocuments(query);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(payouts)),
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteAffiliate(id: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const affiliate = await Affiliate.findById(id);
    if (!affiliate) throw new Error("Affiliate not found");

    // Optionally check if they have earnings/payouts before deleting or just delete everything
    await AffiliateEarning.deleteMany({ affiliate: id });
    await AffiliatePayout.deleteMany({ affiliate: id });
    await Affiliate.findByIdAndDelete(id);

    revalidatePath("/admin/affiliates");
    return { success: true, message: "Affiliate and related data deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deletePayoutRequest(id: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const payout = await AffiliatePayout.findById(id);
    if (!payout) throw new Error("Payout request not found");

    // If pending, maybe refund? Usually delete means it was a mistake or cleanup.
    // If user wants to "reject" they should use updatePayoutStatus.

    await AffiliatePayout.findByIdAndDelete(id);

    revalidatePath("/admin/payouts");
    return { success: true, message: "Payout request deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updatePayoutStatus(id: string, status: "paid" | "rejected", adminNote?: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const payout = await AffiliatePayout.findById(id);
    if (!payout) throw new Error("Payout not found");
    if (payout.status !== "pending" && payout.status !== "processing") {
      throw new Error("Payout already processed");
    }

    if (status === "rejected") {
      // Refund affiliate balance
      const affiliate = await Affiliate.findById(payout.affiliate);
      if (affiliate) {
        affiliate.earningsBalance += payout.amount;
        await affiliate.save();
      }
    }

    payout.status = status;
    payout.adminNote = adminNote;
    await payout.save();

    if (status === "paid") {
      const populatedPayout = await AffiliatePayout.findById(payout._id).populate({
        path: "affiliate",
        populate: { path: "user", select: "name email" },
      });

      if (populatedPayout) {
        const affiliate = populatedPayout.affiliate as any;
        const user = affiliate.user as unknown as { email: string; name: string; addresses?: any[] };
        const phone = user.addresses?.[0]?.phone;
        await sendAffiliatePayoutNotification({
          email: user.email,
          name: user.name,
          amount: populatedPayout.amount,
          paymentMethod: populatedPayout.paymentMethod,
          phone,
        });
      }
    }

    revalidatePath("/admin/payouts");
    return { success: true, message: `Payout ${status}` };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
