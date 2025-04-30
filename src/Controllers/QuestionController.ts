import { Request, Response } from 'express';
import {Question} from '../Models/QuestionModel'; 
import { generateQuestions } from '../cron/generateQuestions';
import cron from 'node-cron';

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { content,topic, difficulty, explanation, answerOptions, correctAnswer } = req.body;

    const newQuestion = new Question({
      content,
      topic,
      difficulty,
      correctAnswer,
      answerOptions,
      explanation
    });

    const savedQuestion = await newQuestion.save();
     res.status(201).json(savedQuestion);
     return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating question' });
    return;
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty } = req.query;

    let query: any = {};
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = { $lte: Number(difficulty) };

    const questions = await Question.find(query);
    res.status(200).json(questions);
    return;
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: 'Error fetching questions' });
     return;
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
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.status(200).json(updatedQuestion);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating question' });
    return;
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;

    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.status(200).json({ message: 'Question deleted successfully' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting question' });
    return;
  }
};

  // Function to generate questions automatically
  export const generateQuestionsAutomatically = async () => {
    try {
  
      // Generate questions based on the prompt
      const generatedQuestions = await generateQuestions();
  
      console.log('Questions generated successfully');
  
      return generatedQuestions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  };
  
  // Schedule the cron job to run at 2 AM every day
  cron.schedule('0 2 * * *', async () => {
    try {
      await generateQuestionsAutomatically();
      console.log("Questions generated successfully");
    } catch (error) {
      console.error("Error generating questions:", error);
    }
  });
