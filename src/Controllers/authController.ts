import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../Models/UserModel";

// Types
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Secrets
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_SECRET || "refresh-secret";

// Utils
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Generate tokens
const generateAccessToken = (user: { userId: string; email: string }) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user: { userId: string; email: string }) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// 🟢 Register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
       res.status(400).json({ message: "All fields are required" });
       return;
    }

    if (!isValidEmail(email)) {
       res.status(400).json({ message: "Invalid email format" });
       return;
    }

    if (password.length < 6) {
       res.status(400).json({ message: "Password must be at least 6 characters" });
       return;
    }

    if (password !== confirmPassword) {
       res.status(400).json({ message: "Passwords do not match" });
       return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
       res.status(400).json({ message: "User already exists" });
       return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, passwordHash });

    const userPayload = { userId: newUser._id.toString(), email: newUser.email };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// 🟢 Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
       res.status(400).json({ message: "Email and password are required" });
       return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
       res.status(401).json({ message: "Invalid credentials" });
       return;
    }

    const userPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// 🟢 Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.body.refreshToken;

  if (!token) {
     res.status(401).json({ message: "No refresh token provided" });
     return;
  }

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      userId: string;
      email: string;
    };

    const newAccessToken = generateAccessToken({ userId: decoded.userId, email: decoded.email });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
     res.status(403).json({ message: "Invalid refresh token" });
     return;
  }
};

// 🟢 Verify Token
export const verifyToken = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("-passwordHash");
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Error verifying token" });
  }
};

// 🟢 Complete Onboarding
export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    user.hasCompletedOnboarding = true;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    res.status(500).json({ message: "Error completing onboarding" });
  }
};

// 🟢 Logout (Client should delete refresh token from storage)
export const logout = async (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful" });
};
