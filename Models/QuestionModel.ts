import { Schema, model, Document } from 'mongoose';

export interface IQuestion extends Document {
  content: string;
  topic: 'math' | 'english' | 'hebrew'; 
  difficulty: number;
  correctAnswer: string;
  answerOptions: string[];
  explanation?: string;
}

const QuestionSchema = new Schema<IQuestion>({
  content: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: Number, required: true },
  correctAnswer: { type: String, required: true },
  answerOptions: { type: [String], required: true },
  explanation: { type: String }
});

export const Question = model<IQuestion>('Question', QuestionSchema);
