// components/applications/types.ts
import type { APPLICATION_STATUSES } from '@/lib/validation';

/** Shape the applications API returns for a single row. */
export interface ApplicationDTO {
  _id: string;
  companyName: string;
  position: string;
  status: (typeof APPLICATION_STATUSES)[number];
  priority: 'high' | 'medium' | 'low';
  applicationDate: string;
  lastUpdated?: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
}

/** Shared badge classes so the table, the board and the cards agree on colour. */
export const STATUS_STYLES: Record<string, string> = {
  applied: 'status-neutral',
  screening: 'status-warning',
  interview_scheduled: 'status-info',
  interview_completed: 'status-info',
  offer: 'status-positive',
  rejected: 'status-negative',
  withdrawn: 'status-neutral',
};

export const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview_scheduled: 'Interview scheduled',
  interview_completed: 'Interview completed',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const PRIORITY_STYLES: Record<string, string> = {
  high: 'status-negative',
  medium: 'status-warning',
  low: 'status-info',
};
