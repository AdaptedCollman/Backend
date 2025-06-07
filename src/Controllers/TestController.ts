import { Request, Response } from 'express';
import { Test } from '../Models/TestModel';
import { Question } from '../Models/QuestionModel';
import { UserQuestion } from '../Models/UserQuestionModel';



export const getUserStatsFromTests = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const tests = await Test.find({ user: userId, endedAt: { $exists: true } })
      .sort({ startedAt: 1 }); // סידור לפי סדר ביצוע המבחנים

    if (!tests.length) {
       res.json({
        averageScore: 0,
        totalQuestions: 0,
        averageDuration: "0s",
        scores: [],
      });
      return
    }

    const totalScore = tests.reduce((sum, test) => sum + (test.score ?? 0), 0);
    const totalDuration = tests.reduce((sum, test) => {
      const duration = test.endedAt && test.startedAt
        ? (test.endedAt.getTime() - test.startedAt.getTime()) / 1000
        : 0;
      return sum + duration;
    }, 0);

    const averageScore = totalScore / tests.length;
    const averageDurationSec = totalDuration / tests.length;

    const formatDuration = (seconds: number): string => {
      if (seconds >= 3600) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
      } else if (seconds >= 60) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s}s`;
      } else {
        return `${Math.round(seconds)}s`;
      }
    };

    const scores = tests.map((t) => t.score ?? 0); // מערך של ציונים

     res.json({
      averageScore: averageScore.toFixed(1),
      totalQuestions: tests.length * 63,
      averageDuration: formatDuration(averageDurationSec),
      scores,
    });
    return
  } catch (err) {
    console.error("Error calculating user stats:", err);
    res.status(500).json({ error: "Failed to fetch test statistics" });
  }
};


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

    res.status(201).json({
      testId: test._id,
      questions: selectedQuestions.map((q: any) => ({
        id: q._id,
        content: q.content,
        answerOptions: q.answerOptions
      }))
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating test' });
    return ;
  }
};

export const getTest = async (req: Request, res: Response) => {
    try {
      const testId = req.params.id;
  
      const test = await Test.findById(testId)
        // .populate('user', 'name email') 
        // .exec();
  
      if (!test) {
        res.status(404).json({ error: 'Error finding test' });
        return;
      }
  
      res.status(200).json(test);
      return ;
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching test' });
      return;
    }
};

export const finishTest = async (req: Request, res: Response) => {
    try {
      const testId = req.params.id;
      const { score } = req.body;  
  
      // Update the test with the score and end time
      const test = await Test.findByIdAndUpdate(testId, { endedAt: new Date(), score }, { new: true }).exec();
  
      if (!test) {
        res.status(404).json({ error: 'Error: Test not found' });
        return ;
      }
  
      res.status(200).json({ message: 'Test finished', test });
      return ;
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error finishing test' });
      return;
    }
  };

  export const getAllTests = async (req:Request,res:Response) => {
    try{
      const allTests = await Test.find({});
      if (!allTests || allTests.length === 0) {
        res.status(200).send("no tests found")
        return
      }
      res.status(200).json(allTests);

    }
    catch(error){
      console.error("Error reaching the DB:", error);
    res.status(500).json({ error: "Failed to fetch tests from database" })
      
    }
  }
  
  
