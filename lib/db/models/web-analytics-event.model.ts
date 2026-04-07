import { Document, Model, Schema, model, models } from "mongoose";

export type AnalyticsDeviceType = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

export interface IWebAnalyticsEvent extends Document {
  visitorId: string;
  sessionId: string;
  path: string;
  href: string;
  title?: string;
  referrer?: string;
  referrerHost?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType: AnalyticsDeviceType;
  os: string;
  browser: string;
  userAgent: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const webAnalyticsEventSchema = new Schema<IWebAnalyticsEvent>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    href: { type: String, required: true },
    title: { type: String },
    referrer: { type: String },
    referrerHost: { type: String, index: true },
    country: { type: String, index: true },
    region: { type: String },
    city: { type: String },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "bot", "unknown"],
      default: "unknown",
      index: true,
    },
    os: { type: String, default: "Unknown", index: true },
    browser: { type: String, default: "Unknown", index: true },
    userAgent: { type: String, required: true },
    screenWidth: { type: Number },
    screenHeight: { type: Number },
    language: { type: String },
    timezone: { type: String },
  },
  { timestamps: true }
);

webAnalyticsEventSchema.index({ createdAt: -1, path: 1 });
webAnalyticsEventSchema.index({ createdAt: -1, sessionId: 1 });

const WebAnalyticsEvent =
  (models.WebAnalyticsEvent as Model<IWebAnalyticsEvent>) ||
  model<IWebAnalyticsEvent>("WebAnalyticsEvent", webAnalyticsEventSchema);

export default WebAnalyticsEvent;
