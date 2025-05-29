import mongoose, { Document, Schema } from "mongoose";

export interface ISubjectStats {
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  level: number;
  progress: number;
}

export interface IUserStats extends Document {
  userId: string;
  subjects: {
    english: ISubjectStats;
    hebrew: ISubjectStats;
    math: ISubjectStats;
  };
  totalQuestions: number;
  totalCorrect: number;
  totalTimeSpent: number;
  weeklyStreak: number;
}

const SubjectStatsSchema = new Schema<ISubjectStats>({
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  progress: { type: Number, default: 0 },
});

const UserStatsSchema = new Schema<IUserStats>({
  userId: { type: String, required: true, unique: true },
  subjects: {
    english: { type: SubjectStatsSchema, default: () => ({}) },
    hebrew: { type: SubjectStatsSchema, default: () => ({}) },
    math: { type: SubjectStatsSchema, default: () => ({}) },
  },
  totalQuestions: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  weeklyStreak: { type: Number, default: 0 },
});

export default mongoose.model<IUserStats>("UserStats", UserStatsSchema);
