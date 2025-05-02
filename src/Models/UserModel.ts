import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  currentLevel: number;
  hasCompletedOnboarding: boolean;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  currentLevel: { type: Number, default: 1 },
  hasCompletedOnboarding: { type: Boolean, default: false },
});

export const User = model<IUser>("User", UserSchema);
