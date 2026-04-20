import { z } from "zod";

export const SupportTicketInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Email is invalid"),
  type: z.enum(["complaint", "query", "recommendation"]),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});
