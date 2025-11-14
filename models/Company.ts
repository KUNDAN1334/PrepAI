// models/Company.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  companyName: string;
  data: any;
  scrapedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  companyName: { type: String, required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  scrapedAt: { type: Date, required: true, index: true },
});

export default mongoose.models.Company || 
  mongoose.model<ICompany>('Company', CompanySchema);
