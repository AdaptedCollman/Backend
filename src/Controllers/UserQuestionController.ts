import { Request, Response } from 'express';
import { UserQuestion } from '../Models/UserQuestionModel';

// יצירת UserQuestion חדש
export const createUserQuestion = async (req: Request, res: Response) => {
  try {
    const {
      user,
      question,
      test,
      answeredAt,
      selectedAnswer,
      isCorrect,
      timeTaken
    } = req.body;

    const newUserQuestion = new UserQuestion({
      user,
      question,
      test,
      answeredAt,
      selectedAnswer,
      isCorrect,
      timeTaken
    });

    const saved = await newUserQuestion.save();
    res.status(201).json(saved);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user question' });
    return ;
  }
};

// קבלת כל UserQuestions (אפשר להוסיף פילטרים לפי צורך)
export const getUserQuestions = async (_req: Request, res: Response) => {
  try {
    const data = await UserQuestion.find()
      .populate('user')
      .populate('question')
      .populate('test');
    res.status(200).json(data);
    return ;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user questions' });
    return;
  }
};

// קבלת UserQuestion לפי ID
export const getUserQuestionById = async (req: Request, res: Response) => {
  try {
    const userQuestion = await UserQuestion.findById(req.params.id)
      .populate('user')
      .populate('question')
      .populate('test');

    if (!userQuestion) {
      res.status(404).json({ error: 'User question not found' });
      return;
    }

    res.status(200).json(userQuestion);
    return ;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user question' });
    return ;
  }
};

// עדכון UserQuestion לפי ID
export const updateUserQuestion = async (req: Request, res: Response) => {
  try {
    const updated = await UserQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'User question not found' });
      return ;
    }

    res.status(200).json(updated);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user question' });
    return;
  }
};

// מחיקת UserQuestion לפי ID
export const deleteUserQuestion = async (req: Request, res: Response) => {
  try {
    const deleted = await UserQuestion.findByIdAndDelete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: 'User question not found' });
      return ;
    }

    res.status(200).json({ message: 'User question deleted successfully' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user question' });
    return;
  }
};
