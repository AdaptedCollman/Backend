import { Request, Response } from "express";
import { User } from "../Models/UserModel";

// שליפת משתמש לפי ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user" });
    return;
  }
};

// עדכון משתמש לפי ID
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("_id name email currentLevel hasCompletedOnboarding profileImage");

    if (!updatedUser) {
       res.status(404).json({ error: "User not found" });
       return
    }

    // שים לב שה-id מוחזר בשם הנכון (id ולא _id)
    const userResponse = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      currentLevel: updatedUser.currentLevel,
      hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
      profileImage: updatedUser.profileImage,
    };

     res.status(200).json(userResponse);
     return
  } catch (err) {
    console.error("Error updating user:", err);
     res.status(500).json({ error: "Error updating user" });
     return
  }
};

