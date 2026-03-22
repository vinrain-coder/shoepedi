import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IAdminNotificationState extends Document {
  adminUser: Types.ObjectId;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const adminNotificationStateSchema = new Schema<IAdminNotificationState>(
  {
    adminUser: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AdminNotificationState =
  (models.AdminNotificationState as Model<IAdminNotificationState> | undefined) ||
  model<IAdminNotificationState>(
    "AdminNotificationState",
    adminNotificationStateSchema
  );

export default AdminNotificationState;
