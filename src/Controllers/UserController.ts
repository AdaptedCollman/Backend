import { Request, Response } from 'express';
import { User } from '../Models/UserModel'; // תוודא שזה הנתיב הנכון

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
    return;
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
    return;
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) res.status(404).json({ error: 'User not found' });
    return;
    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
    return;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) res.status(404).json({ error: 'User not found' });
    return;
    res.status(200).json(updatedUser);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
    return;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)  res.status(404).json({ error: 'User not found' });
    return;
    res.status(200).json({ message: 'User deleted successfully' });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
    return;
  }
};
