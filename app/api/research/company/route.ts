// app/api/research/company/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const query = searchParams.get('query') || '';

    if (!company) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    try {
      const response = await fetch(
        `${PYTHON_SERVICE_URL}/research/company?company=${encodeURIComponent(company)}&query=${encodeURIComponent(query)}&platforms=reddit,gfg,leetcode`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(55000),
        }
      );

      if (!response.ok) {
        throw new Error(`Service returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Research service error:', fetchError);

      return NextResponse.json({
        company,
        ai_insights: {
          summary: [
            `Detailed AI research is temporarily unavailable for ${company} because the external Python scraping service is not reachable.`,
            '',
            'You can still deploy this app on Vercel and use the rest of the platform normally.',
            '',
            'To re-enable full company research:',
            '1. Deploy `services/scraping-service` on Railway, Render, or another Python host.',
            '2. Set `PYTHON_SERVICE_URL` and `SCRAPING_SERVICE_URL` in Vercel to that deployed backend URL.',
            query ? `3. Re-run your question: "${query}"` : '3. Re-run the research request after the backend is live.',
          ].join('\n'),
          sources_analyzed: {
            total: 0,
            gfg_articles: 0,
            leetcode_topics: 0,
            medium_articles: 0,
            reddit_posts: 0,
          },
          error: 'External research service unavailable',
        },
      });
    }
  } catch (error: any) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete research' },
      { status: 500 }
    );
  }
}
