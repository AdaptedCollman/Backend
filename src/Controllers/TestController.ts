import { Request, Response } from "express";
import { Test } from "../Models/TestModel";
import { Question } from "../Models/QuestionModel";
import { UserQuestion } from "../Models/UserQuestionModel";
import UserStats from "../Models/UserStats";

export const getUserStatsFromTests = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Get ALL tests for the user, not just completed ones
    const allTests = await Test.find({ user: userId }).sort({ startedAt: 1 });

    // Separate completed and incomplete tests
    const completedTests = allTests.filter((test) => test.endedAt);
    const incompleteTests = allTests.filter((test) => !test.endedAt);

    if (!allTests.length) {
      res.json({
        averageScore: "0",
        totalQuestions: 0,
        averageDuration: "0s",
        scores: [],
        recentActivity: [],
        performanceTrend: "stable",
        bestScore: 0,
        worstScore: 0,
        totalTests: 0,
        sectionStats: {
          verbal: { correct: 0, total: 0, percentage: 0 },
          quantitative: { correct: 0, total: 0, percentage: 0 },
          english: { correct: 0, total: 0, percentage: 0 },
        },
      });
      return;
    }

    // Calculate stats from completed tests
    const totalScore = completedTests.reduce(
      (sum, test) => sum + (test.score ?? 0),
      0
    );
    const totalDuration = completedTests.reduce((sum, test) => {
      const duration =
        test.endedAt && test.startedAt
          ? (test.endedAt.getTime() - test.startedAt.getTime()) / 1000
          : 0;
      return sum + duration;
    }, 0);

    const averageScore =
      completedTests.length > 0 ? totalScore / completedTests.length : 0;
    const averageDurationSec =
      completedTests.length > 0 ? totalDuration / completedTests.length : 0;
    const scores = completedTests.map((t) => t.score ?? 0);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Calculate performance trend
    let performanceTrend: "improving" | "declining" | "stable" = "stable";
    if (scores.length >= 3) {
      const recentScores = scores.slice(-3);
      const firstHalf = recentScores.slice(
        0,
        Math.ceil(recentScores.length / 2)
      );
      const secondHalf = recentScores.slice(Math.ceil(recentScores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 10) performanceTrend = "improving";
      else if (secondAvg < firstAvg - 10) performanceTrend = "declining";
    }

    // Get user stats for section performance
    const userStats = await UserStats.findOne({ userId });

    // Calculate section stats from UserStats
    const sectionStats = {
      verbal: { correct: 0, total: 0, percentage: 0 },
      quantitative: { correct: 0, total: 0, percentage: 0 },
      english: { correct: 0, total: 0, percentage: 0 },
    };

    if (userStats) {
      // Hebrew/Verbal section
      sectionStats.verbal.total = userStats.subjects.hebrew.questionsAnswered;
      sectionStats.verbal.correct = userStats.subjects.hebrew.correctAnswers;
      sectionStats.verbal.percentage =
        userStats.subjects.hebrew.questionsAnswered > 0
          ? Math.round(
              (userStats.subjects.hebrew.correctAnswers /
                userStats.subjects.hebrew.questionsAnswered) *
                100
            )
          : 0;

      // Math/Quantitative section
      sectionStats.quantitative.total =
        userStats.subjects.math.questionsAnswered;
      sectionStats.quantitative.correct =
        userStats.subjects.math.correctAnswers;
      sectionStats.quantitative.percentage =
        userStats.subjects.math.questionsAnswered > 0
          ? Math.round(
              (userStats.subjects.math.correctAnswers /
                userStats.subjects.math.questionsAnswered) *
                100
            )
          : 0;

      // English section
      sectionStats.english.total = userStats.subjects.english.questionsAnswered;
      sectionStats.english.correct = userStats.subjects.english.correctAnswers;
      sectionStats.english.percentage =
        userStats.subjects.english.questionsAnswered > 0
          ? Math.round(
              (userStats.subjects.english.correctAnswers /
                userStats.subjects.english.questionsAnswered) *
                100
            )
          : 0;
    }

    // Prepare recent activity from all tests (including incomplete ones)
    const recentActivity = allTests.slice(-5).map((test) => ({
      id: test._id.toString(),
      date:
        test.endedAt?.toISOString() ||
        test.startedAt?.toISOString() ||
        new Date().toISOString(),
      score: test.score || 0,
      duration:
        test.endedAt && test.startedAt
          ? Math.floor(
              (test.endedAt.getTime() - test.startedAt.getTime()) / 1000
            )
          : 0,
    }));

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

    res.json({
      averageScore: averageScore.toFixed(1),
      totalQuestions: allTests.length * 63, // Total questions from all tests
      averageDuration: formatDuration(averageDurationSec),
      scores,
      recentActivity,
      performanceTrend,
      bestScore,
      worstScore,
      totalTests: allTests.length, // Total tests (completed + incomplete)
      sectionStats,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch test statistics" });
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      numQuestions = 20,
      topics = ["math", "english", "hebrew"],
      difficulty = 3,
    } = req.body;

    const selectedQuestions: any[] = [];

    for (const topic of topics) {
      const questions = await Question.aggregate([
        { $match: { topic, difficulty: { $lte: difficulty } } }, // Select questions by topic and difficulty from difficulty level and below
        { $sample: { size: Math.ceil(numQuestions / topics.length) } }, // //Randomly select questions
      ]);
      selectedQuestions.push(...questions);
    }

    // If we don't have enough questions from the selected topics, fill in with random questions
    if (selectedQuestions.length < numQuestions) {
      const remainingQuestions = await Question.aggregate([
        { $match: { difficulty: { $lte: difficulty } } },
        { $sample: { size: numQuestions - selectedQuestions.length } },
      ]);
      selectedQuestions.push(...remainingQuestions);
    }

    // Create a new test
    const test = await Test.create({
      user: userId,
      startedAt: new Date(),
      score: 0, // ציון ראשוני
    });

    // Create user questions for each selected question
    const userQuestions = selectedQuestions.map((question: any) => ({
      user: userId,
      question: question._id,
      test: test._id,
      selectedAnswer: null, // No answer selected yet
      isCorrect: null, // Will be determined later
      timeTaken: null, // Will be determined later
    }));

    await UserQuestion.insertMany(userQuestions);

    res.status(201).json({
      testId: test._id,
      questions: selectedQuestions.map((q: any) => ({
        id: q._id,
        content: q.content,
        answerOptions: q.answerOptions,
      })),
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating test" });
    return;
  }
};

export const getTest = async (req: Request, res: Response) => {
  try {
    const testId = req.params.id;

    const test = await Test.findById(testId);
    // .populate('user', 'name email')
    // .exec();

    if (!test) {
      res.status(404).json({ error: "Error finding test" });
      return;
    }

    res.status(200).json(test);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching test" });
    return;
  }
};

export const finishTest = async (req: Request, res: Response) => {
  try {
    const testId = req.params.id;
    const { score } = req.body;

    // Update the test with the score and end time
    const test = await Test.findByIdAndUpdate(
      testId,
      { endedAt: new Date(), score },
      { new: true }
    ).exec();

    if (!test) {
      res.status(404).json({ error: "Error: Test not found" });
      return;
    }

    res.status(200).json({ message: "Test finished", test });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error finishing test" });
    return;
  }
};

export const getAllTests = async (req: Request, res: Response) => {
  try {
    const allTests = await Test.find({});
    if (!allTests || allTests.length === 0) {
      res.status(200).send("no tests found");
      return;
    }
    res.status(200).json(allTests);
  } catch (error) {
    console.error("Error reaching the DB:", error);
    res.status(500).json({ error: "Failed to fetch tests from database" });
  }
};
