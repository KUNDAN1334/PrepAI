// app/api/company/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Company from '@/models/Company';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    await connectDB();

    // Check if we have cached data (less than 7 days old)
    const cachedData = await Company.findOne({
      companyName: new RegExp(query, 'i'),
      scrapedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (cachedData) {
      return NextResponse.json(cachedData.data);
    }

    // Call scraping service
    const scrapingServiceUrl = process.env.SCRAPING_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${scrapingServiceUrl}/scrape/reddit?company=${encodeURIComponent(query)}&limit=50`);

    if (!response.ok) {
      throw new Error('Failed to fetch data from scraping service');
    }

    const data = await response.json();

    // Cache the data
    await Company.findOneAndUpdate(
      { companyName: query },
      {
        companyName: query,
        data,
        scrapedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in company search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search company data' },
      { status: 500 }
    );
  }
}
