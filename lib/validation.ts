// lib/validation.ts
import { z } from 'zod';

/**
 * Every write endpoint validates against a schema here rather than spreading the
 * request body into a Mongoose model. Spreading is what allowed a client to send
 * `{"userId": "<someone else's id>"}` and have it overwrite the server-set owner.
 */

export const APPLICATION_STATUSES = [
  'applied',
  'screening',
  'interview_scheduled',
  'interview_completed',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export const APPLICATION_PRIORITIES = ['high', 'medium', 'low'] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? undefined : value));

export const applicationCreateSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  position: z.string().trim().min(1, 'Position is required').max(120),
  jobDescription: optionalText(20000),
  applicationDate: z.coerce.date().optional(),
  status: z.enum(APPLICATION_STATUSES).default('applied'),
  priority: z.enum(APPLICATION_PRIORITIES).default('medium'),
  salary: optionalText(60),
  location: optionalText(120),
  jobUrl: z.union([z.url(), z.literal('')]).optional(),
  contactPerson: optionalText(120),
  notes: optionalText(5000),
  source: optionalText(60),
});

export const applicationUpdateSchema = applicationCreateSchema.partial();

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

export const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const QUESTION_TYPES = ['technical', 'coding', 'hr', 'behavioral', 'system-design'] as const;

export const questionCreateSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  jobRole: z.string().trim().min(1, 'Job role is required').max(120),
  interviewRound: z.string().trim().min(1, 'Interview round is required').max(120),
  difficulty: z.enum(QUESTION_DIFFICULTIES),
  questionType: z.enum(QUESTION_TYPES),
  questionText: z.string().trim().min(10, 'Question must be at least 10 characters').max(5000),
  contributorAnswer: optionalText(10000),
  additionalContext: optionalText(2000),
  isAnonymous: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
});

export const voteSchema = z.object({
  voteType: z.enum(['up', 'down']),
});

export const EXPERIENCE_LEVELS = ['entry', 'intermediate', 'senior'] as const;
export const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'Mixed'] as const;
export const INTERVIEW_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export const mockInterviewCreateSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  jobRole: z.string().trim().min(1, 'Job role is required').max(120),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  interviewType: z.enum(INTERVIEW_TYPES),
  difficulty: z.enum(INTERVIEW_DIFFICULTIES),
  numQuestions: z.coerce.number().int().min(3).max(20).default(10),
  jobDescription: optionalText(20000),
});

export const answerSubmitSchema = z.object({
  questionNumber: z.coerce.number().int().min(1),
  answer: z.string().trim().min(50, 'Answer must be at least 50 characters').max(20000),
  timeSpent: z.coerce.number().int().min(0).max(60 * 60 * 6).optional(),
});

export const PROFILE_EXPERIENCE_LEVELS = ['Fresher', '1-3 years', '3-5 years', '5+ years'] as const;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  phone: optionalText(20),
  location: optionalText(120),
  bio: optionalText(600),
  experienceLevel: z.enum(PROFILE_EXPERIENCE_LEVELS).optional(),
  targetRoles: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
  socialLinks: z
    .object({
      linkedin: z.union([z.url(), z.literal('')]).optional(),
      github: z.union([z.url(), z.literal('')]).optional(),
      twitter: z.union([z.url(), z.literal('')]).optional(),
    })
    .default({}),
});
