// models/Application.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  position: string;
  jobDescription?: string;
  jobDescriptionUrl?: string;
  applicationDate: Date;
  status: string;
  priority: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  contactPerson?: string;
  notes?: string;
  source: string;
  referralName?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  interviewRounds?: Array<{
    roundName: string;
    date?: Date;
    interviewerName?: string;
    status: string;
    notes?: string;
  }>;
  statusHistory: Array<{
    status: string;
    changedAt: Date;
  }>;
  lastUpdated: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, required: true },
  position: { type: String, required: true },
  jobDescription: { type: String },
  jobDescriptionUrl: { type: String },
  applicationDate: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    required: true, 
    enum: ['applied', 'screening', 'interview_scheduled', 'interview_completed', 'offer', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  priority: { 
    type: String, 
    required: true,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  salary: { type: String },
  location: { type: String },
  jobUrl: { type: String },
  contactPerson: { type: String },
  notes: { type: String },
  source: { type: String, required: true, default: 'Manual' },
  referralName: { type: String },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' },
  },
  interviewRounds: [{
    roundName: { type: String },
    date: { type: Date },
    interviewerName: { type: String },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    notes: { type: String },
  }],
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
  }],
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Add pre-save hook to track status changes
ApplicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

// Clear any existing model
if (mongoose.models.Application) {
  delete mongoose.models.Application;
}

const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
