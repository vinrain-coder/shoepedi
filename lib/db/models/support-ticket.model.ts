import { Document, Model, Schema, Types, model, models } from "mongoose";

export type SupportTicketType = "complaint" | "query" | "recommendation";
export type SupportTicketStatus = "open" | "replied";

export interface ISupportTicket extends Document {
  user?: Types.ObjectId;
  name: string;
  email: string;
  type: SupportTicketType;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  adminReply?: string;
  adminRepliedAt?: Date;
  adminRepliedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    type: {
      type: String,
      enum: ["complaint", "query", "recommendation"],
      required: true,
      default: "query",
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "replied"],
      default: "open",
      index: true,
    },
    adminReply: { type: String, default: "" },
    adminRepliedAt: { type: Date },
    adminRepliedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

supportTicketSchema.index({ createdAt: -1, status: 1 });

const SupportTicket =
  (models.SupportTicket as Model<ISupportTicket> | undefined) ||
  model<ISupportTicket>("SupportTicket", supportTicketSchema);

export default SupportTicket;
