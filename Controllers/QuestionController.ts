import { Request, Response } from 'express';
import {Question} from '../Models/QuestionModel'; 

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, questionText, options, correctAnswer } = req.body;

    const newQuestion = new Question({
      topic,
      difficulty,
      questionText,
      options,
      correctAnswer
    });

    const savedQuestion = await newQuestion.save();
    return res.status(201).json(savedQuestion);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error creating question' });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty } = req.query;

    let query: any = {};
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = { $lte: Number(difficulty) };

    const questions = await Question.find(query);
    return res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error fetching questions' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;
    const { topic, difficulty, questionText, options, correctAnswer } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { topic, difficulty, questionText, options, correctAnswer },
      { new: true } 
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    return res.status(200).json(updatedQuestion);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error updating question' });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;

    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error deleting question' });
  }
};
