import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IPasswordResetToken extends Document {
  user: Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: 900 },
});

const PasswordResetToken =
  (models.PasswordResetToken as Model<IPasswordResetToken> | undefined) ||
  model<IPasswordResetToken>("PasswordResetToken", passwordResetTokenSchema);

export default PasswordResetToken;
