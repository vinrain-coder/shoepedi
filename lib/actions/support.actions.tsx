"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import { getServerSession } from "../get-session";
import { formatError } from "../utils";
import SupportTicket from "../db/models/support-ticket.model";
import {
  sendAdminEventNotification,
  sendSupportTicketReplyEmail,
} from "@/lib/email/transactional";

type SupportTicketDto = {
  _id: string;
  name: string;
  email: string;
  type: "complaint" | "query" | "recommendation";
  subject: string;
  message: string;
  status: "open" | "replied";
  adminReply?: string;
  createdAt: string;
};


export async function createSupportTicket(input: {
  name: string;
  email: string;
  type: "complaint" | "query" | "recommendation";
  subject: string;
  message: string;
}) {
  try {
    const session = await getServerSession();
    await connectToDatabase();

    const payload = {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      type: input.type,
      subject: input.subject.trim(),
      message: input.message.trim(),
      user: session?.user?.id,
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      throw new Error("All fields are required.");
    }

    const ticket = await SupportTicket.create(payload);

    await sendAdminEventNotification({
      title: `New support ${payload.type}`,
      description: `${payload.name} (${payload.email}) submitted: ${payload.subject}`,
      href: "/admin/support",
      meta: "Support inbox",
      createdAt: ticket.createdAt.toISOString(),
    });

    revalidatePath("/account/support");
    revalidatePath("/admin/support");

    return { success: true, message: "Support request submitted successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getMySupportTickets() {
  try {
    const session = await getServerSession();
    if (!session?.user) throw new Error("User is not authenticated");

    await connectToDatabase();

    const tickets = await SupportTicket.find({
      $or: [{ user: session.user.id }, { email: session.user.email }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(tickets)) as SupportTicketDto[] };
  } catch (error) {
    return { success: false, message: formatError(error), data: [] as SupportTicketDto[] };
  }
}

export async function getSupportTicketsAdmin() {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Admin permission required");
    }

    await connectToDatabase();
    const tickets = await SupportTicket.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(tickets)) as SupportTicketDto[] };
  } catch (error) {
    return { success: false, message: formatError(error), data: [] as SupportTicketDto[] };
  }
}

export async function replySupportTicket(input: { id: string; reply: string }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Admin permission required");
    }

    const reply = input.reply.trim();
    if (!reply) throw new Error("Reply is required");

    await connectToDatabase();

    const ticket = await SupportTicket.findById(input.id);
    if (!ticket) throw new Error("Support ticket not found");

    ticket.adminReply = reply;
    ticket.status = "replied";
    ticket.adminRepliedAt = new Date();
    ticket.adminRepliedBy = session.user.name || session.user.email;
    await ticket.save();

    await sendSupportTicketReplyEmail({
      to: ticket.email,
      customerName: ticket.name,
      subject: ticket.subject,
      originalMessage: ticket.message,
      replyMessage: reply,
    });

    revalidatePath("/admin/support");
    revalidatePath("/account/support");

    return { success: true, message: "Reply sent to customer email successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
