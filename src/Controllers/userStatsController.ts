import { Request, Response } from "express";
import UserStats from "../Models/UserStats";

const allowedSubjects = ["english", "hebrew", "math"] as const;
type Subject = (typeof allowedSubjects)[number];

export const getUserStats = async (req: Request, res: Response) => {
  const { userId } = req.params;
  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = new UserStats({ userId });
    await stats.save();
  }
  res.json(stats);
};

export const trackQuestion = async (req: Request, res: Response) => {
  const { userId, subject, correct, timeSpent } = req.body;

  if (!allowedSubjects.includes(subject)) {
     res.status(400).json({ error: "Invalid subject" });
     return;
  }

  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = new UserStats({ userId });
  }

  const subj = subject as Subject;

  // Defensive initialization for timeSpent
  if (typeof stats.subjects[subj].timeSpent !== 'number') stats.subjects[subj].timeSpent = 0;
  if (typeof stats.totalTimeSpent !== 'number') stats.totalTimeSpent = 0;

  console.log(`[trackQuestion] BEFORE: subject=${subj}, subjectTimeSpent=${stats.subjects[subj].timeSpent}, totalTimeSpent=${stats.totalTimeSpent}`);

  stats.subjects[subj].questionsAnswered += 1;
  if (correct) {
    stats.subjects[subj].correctAnswers += 1;
    stats.subjects[subj].level = Math.min(stats.subjects[subj].level + 1, 5);
  } else {
    stats.subjects[subj].level = Math.max(stats.subjects[subj].level - 1, 1);
  }
  stats.subjects[subj].timeSpent += timeSpent;

  stats.totalQuestions += 1;
  if (correct) stats.totalCorrect += 1;
  stats.totalTimeSpent += timeSpent;

  console.log(`[trackQuestion] AFTER: subject=${subj}, subjectTimeSpent=${stats.subjects[subj].timeSpent}, totalTimeSpent=${stats.totalTimeSpent}, timeSpentAdded=${timeSpent}`);
  console.log(`[trackQuestion] All subjects timeSpent:`, {
    english: stats.subjects.english.timeSpent,
    hebrew: stats.subjects.hebrew.timeSpent,
    math: stats.subjects.math.timeSpent,
  });

  await stats.save();

  res.json({ success: true, updatedStats: stats });
};
