import { Document, Model, Schema, model, models } from "mongoose";

export type NewsletterStatus = "subscribed" | "unsubscribed";

export interface INewsletterSubscription extends Document {
  email: string;
  status: NewsletterStatus;
  source: "footer" | "checkout" | "api" | "manual";
  tags: string[];
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  lastSourceAt: Date;
  unsubscribeToken: string;
}

const newsletterSubscriptionSchema = new Schema<INewsletterSubscription>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
    source: {
      type: String,
      enum: ["footer", "checkout", "api", "manual"],
      default: "footer",
    },
    tags: {
      type: [String],
      default: [],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    lastSourceAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

newsletterSubscriptionSchema.index(
  { email: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "subscribed" } }
);

const NewsletterSubscription =
  (models.NewsletterSubscription as
    | Model<INewsletterSubscription>
    | undefined) ||
  model<INewsletterSubscription>(
    "NewsletterSubscription",
    newsletterSubscriptionSchema
  );

export default NewsletterSubscription;
