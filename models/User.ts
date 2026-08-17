// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  phone?: string;
  location?: string;
  bio?: string;
  experienceLevel?: string;
  targetRoles?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  quota: {
    resumeOptimizations: {
      dailyLimit: number;
      usedToday: number;
      lastResetDate: Date;
    };
    mockInterviews: {
      monthlyLimit: number;
      usedThisMonth: number;
      lastResetDate: Date;
    };
    groqApiCalls: {
      dailyLimit: number;
      usedToday: number;
      lastResetDate: Date;
    };
  };
  reputation: {
    totalPoints: number;
    badges: Array<{ badgeName: string; earnedAt: Date }>;
    questionContributions: number;
    answerContributions: number;
    bestAnswers: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  emailVerified: { type: Date },
  phone: { type: String },
  location: { type: String },
  bio: { type: String },
  experienceLevel: { type: String, enum: ['Fresher', '1-3 years', '3-5 years', '5+ years'] },
  targetRoles: [{ type: String }],
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String }
  },
  quota: {
    resumeOptimizations: {
      dailyLimit: { type: Number, default: 5 },
      usedToday: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now }
    },
    mockInterviews: {
      monthlyLimit: { type: Number, default: 10 },
      usedThisMonth: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now }
    },
    groqApiCalls: {
      dailyLimit: { type: Number, default: 50 },
      usedToday: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now }
    }
  },
  reputation: {
    totalPoints: { type: Number, default: 0 },
    badges: [{ badgeName: String, earnedAt: Date }],
    questionContributions: { type: Number, default: 0 },
    answerContributions: { type: Number, default: 0 },
    bestAnswers: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
