import { Schema, model, Document, Types } from 'mongoose';

export interface IUserQuestion extends Document {
  user: Types.ObjectId;
  question: Types.ObjectId;
  test?: Types.ObjectId;
  answeredAt?: Date;
  selectedAnswer?: string;
  isCorrect?: boolean;
  timeTaken?: number;
}

const UserQuestionSchema = new Schema<IUserQuestion>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  test: { type: Schema.Types.ObjectId, ref: 'Test' },
  answeredAt: { type: Date },
  selectedAnswer: { type: String },
  isCorrect: { type: Boolean },
  timeTaken: { type: Number }
}, {
  timestamps: true
});


export const UserQuestion = model<IUserQuestion>('UserQuestion', UserQuestionSchema);
