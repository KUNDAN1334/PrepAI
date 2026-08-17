// models/Company.ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Cache entry for AI company research.
 *
 * One document = one (company, question) pair. `scrapedAt` carries a MongoDB TTL
 * index, so expired research is evicted by the server instead of by application
 * code — the read path only ever sees fresh entries and never needs a date filter.
 */
export interface ICompany extends Document {
  companyName: string;
  queryKey: string;
  data: unknown;
  scrapedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  // Stored normalized (lowercase, trimmed) so "Google" and " google " share a cache entry.
  companyName: { type: String, required: true },
  queryKey: { type: String, required: true, default: '' },
  data: { type: Schema.Types.Mixed, required: true },
  // expires: 7 days -> MongoDB deletes the document ~7 days after scrapedAt.
  scrapedAt: { type: Date, required: true, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

CompanySchema.index({ companyName: 1, queryKey: 1 }, { unique: true });

const Company =
  (mongoose.models.Company as mongoose.Model<ICompany>) ||
  mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
