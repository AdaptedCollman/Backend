import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  currentLevel: number;
  hasCompletedOnboarding: boolean;
  refreshToken?: string; // אופציונלי: לשימוש עתידי עם refresh tokens
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    currentLevel: { type: Number, default: 1 },
    hasCompletedOnboarding: { type: Boolean, default: false },
    refreshToken: { type: String }, // אם תחליט לשמור אותו במסד
  },
  {
    timestamps: true, // מוסיף createdAt ו־updatedAt אוטומטית
  }
);

export const User = model<IUser>("User", UserSchema);
