// models/Question.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  contributorId: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  companyName: string;
  jobRole: string;
  interviewRound: string;
  difficulty: string;
  questionType: string;
  questionText: string;
  contributorAnswer?: string;
  tags: string[];
  additionalContext?: string;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  answerCount: number;
  bookmarkCount: number;
  votes: Array<{
    userId: mongoose.Types.ObjectId;
    voteType: string;
    votedAt: Date;
  }>;
  createdAt: Date;
  lastUpdated: Date;
  isVerified: boolean;
  reportCount: number;
}

const QuestionSchema = new Schema<IQuestion>({
  contributorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isAnonymous: { type: Boolean, default: false },
  companyName: { type: String, required: true, index: true },
  jobRole: { type: String, required: true, index: true },
  interviewRound: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  questionType: { type: String, required: true },
  questionText: { type: String, required: true },
  contributorAnswer: { type: String },
  tags: [{ type: String }],
  additionalContext: { type: String },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  answerCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  votes: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    voteType: { type: String, enum: ['up', 'down'] },
    votedAt: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Text index for search
QuestionSchema.index({ questionText: 'text', companyName: 'text', jobRole: 'text' });

export default mongoose.models.Question || 
  mongoose.model<IQuestion>('Question', QuestionSchema);
