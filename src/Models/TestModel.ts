import { Schema, model, Document, Types } from 'mongoose';

export interface ITest extends Document {
  user: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  score?: number;
}

const TestSchema = new Schema<ITest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  score: { type: Number },
}, {
  timestamps: true
});

export const Test = model<ITest>('Test', TestSchema);
