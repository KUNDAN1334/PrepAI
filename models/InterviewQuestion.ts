// models/InterviewQuestion.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQuestion extends Document {
  sessionId: mongoose.Types.ObjectId;
  questionNumber: number;
  questionText: string;
  category: string;
  difficulty: string;
  expectedKeyPoints: string[];
  userAnswer?: string;
  evaluation?: {
    score: number;
    strengths: string[];
    improvements: string[];
    missedKeyPoints: string[];
    overallFeedback: string;
    exampleAnswer: string;
  };
  timeSpent?: number;
  answeredAt?: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  expectedKeyPoints: [{ type: String }],
  userAnswer: { type: String },
  evaluation: {
    score: { type: Number },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    missedKeyPoints: [{ type: String }],
    overallFeedback: { type: String },
    exampleAnswer: { type: String }
  },
  timeSpent: { type: Number },
  answeredAt: { type: Date }
}, {
  timestamps: true
});

const InterviewQuestion =
  (mongoose.models.InterviewQuestion as mongoose.Model<IInterviewQuestion>) ||
  mongoose.model<IInterviewQuestion>('InterviewQuestion', InterviewQuestionSchema);

export default InterviewQuestion;
