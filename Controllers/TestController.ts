import { Request, Response } from 'express';
import { Test } from '../Models/TestModel';
import { Question } from '../Models/QuestionModel';
import { UserQuestion } from '../Models/UserQuestionModel';

// Function to create a test
export const createTest = async (req: Request, res: Response) => {
  try {
    const { userId, numQuestions = 20, topics = ['math', 'english', 'hebrew'], difficulty = 3 } = req.body;

    const selectedQuestions: any[] = [];

    for (const topic of topics) {
      const questions = await Question.aggregate([
        { $match: { topic, difficulty: { $lte: difficulty } } }, // Select questions by topic and difficulty from difficulty level and below
        { $sample: { size: Math.ceil(numQuestions / topics.length) } } // //Randomly select questions
      ]);
      selectedQuestions.push(...questions);
    }

    // If we don't have enough questions from the selected topics, fill in with random questions
    if (selectedQuestions.length < numQuestions) {
      const remainingQuestions = await Question.aggregate([
        { $match: { difficulty: { $lte: difficulty } } },
        { $sample: { size: numQuestions - selectedQuestions.length } }
      ]);
      selectedQuestions.push(...remainingQuestions);
    }

    // Create a new test
    const test = await Test.create({
      user: userId,
      startedAt: new Date(),
      score: 0,  // ציון ראשוני
    });

    // Create user questions for each selected question
    const userQuestions = selectedQuestions.map((question: any) => ({
      user: userId,
      question: question._id,
      test: test._id,
      selectedAnswer: null, // No answer selected yet
      isCorrect: null,      // Will be determined later
      timeTaken: null       // Will be determined later
    }));

    await UserQuestion.insertMany(userQuestions);

    return res.status(201).json({
      testId: test._id,
      questions: selectedQuestions.map((q: any) => ({
        id: q._id,
        content: q.content,
        answerOptions: q.answerOptions
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error creating test' });
  }
};

export const getTest = async (req: Request, res: Response) => {
    try {
      const testId = req.params.id;
  
      const test = await Test.findById(testId)
        // .populate('user', 'name email') 
        // .exec();
  
      if (!test) {
        return res.status(404).json({ error: 'Error finding test' });
      }
  
      return res.status(200).json(test);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching test' });
    }
};

export const finishTest = async (req: Request, res: Response) => {
    try {
      const testId = req.params.id;
      const { score } = req.body;  
  
      // Update the test with the score and end time
      const test = await Test.findByIdAndUpdate(testId, { endedAt: new Date(), score }, { new: true }).exec();
  
      if (!test) {
        return res.status(404).json({ error: 'Error: Test not found' });
      }
  
      return res.status(200).json({ message: 'Test finished', test });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error finishing test' });
    }
  };
  
  
