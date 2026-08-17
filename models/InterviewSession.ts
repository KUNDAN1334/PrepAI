// models/InterviewSession.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  jobDescription?: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  totalQuestions: number;
  questionsAnswered: number;
  averageScore?: number;
}

const InterviewSessionSchema = new Schema<IInterviewSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, required: true },
  jobRole: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  interviewType: { type: String, required: true },
  difficulty: { type: String, required: true },
  jobDescription: { type: String },
  status: { 
    type: String, 
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  completedAt: { type: Date },
  totalQuestions: { type: Number, required: true },
  questionsAnswered: { type: Number, default: 0 },
  averageScore: { type: Number }
}, {
  timestamps: true
});

const InterviewSession =
  (mongoose.models.InterviewSession as mongoose.Model<IInterviewSession>) ||
  mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

export default InterviewSession;
