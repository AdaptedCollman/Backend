import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  currentLevel: number;
  hasCompletedOnboarding: boolean;
  refreshToken?: string;
  profileImage?: string | null; // ✅ חדש
}


const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    currentLevel: { type: Number, default: 1 },
    hasCompletedOnboarding: { type: Boolean, default: false },
    refreshToken: { type: String },
    profileImage: { type: String, default: null }, // ✅ הוספת השדה
  },
  {
    timestamps: true,
  }
);


export const User = model<IUser>("User", UserSchema);
