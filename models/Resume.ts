// models/Resume.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  originalText: string;
  jobDescription: string;
  analysis: {
    matchScore: number;
    atsScore: number;
    missingKeywords: string[];
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
  };
  createdAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalFileName: { type: String, required: true },
  originalText: { type: String, required: true },
  jobDescription: { type: String, required: true },
  analysis: {
    matchScore: { type: Number, required: true },
    atsScore: { type: Number, required: true },
    missingKeywords: [{ type: String }],
    suggestions: [{ type: String }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
  },
}, {
  timestamps: true
});

// Clear any existing model
if (mongoose.models.Resume) {
  delete mongoose.models.Resume;
}

const Resume = mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume;
