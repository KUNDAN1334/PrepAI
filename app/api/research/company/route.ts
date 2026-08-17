// app/api/research/company/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import { requireUserId, withErrorHandling, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SERVICE_TIMEOUT_MS = 55_000;

function serviceUrl(): string {
  return (
    process.env.PYTHON_SERVICE_URL || process.env.SCRAPING_SERVICE_URL || 'http://localhost:8000'
  );
}

/**
 * Links a candidate can follow when the Python research service is unreachable.
 * The feature degrades to "here is where to look" instead of an error screen.
 */
function fallbackInsights(company: string, query: string) {
  const encoded = encodeURIComponent(`${company} interview experience`);
  const slug = company.toLowerCase().trim().replace(/\s+/g, '-');

  return {
    company,
    cached: false,
    degraded: true,
    ai_insights: {
      summary: [
        `## AI research is offline for ${company}`,
        '',
        'The Python research service could not be reached, so this answer was assembled without it.',
        query ? `Your question — _"${query}"_ — was not sent to the model.` : '',
        '',
        '## Research these sources directly',
        '',
        `- [GeeksforGeeks interview experiences](https://www.geeksforgeeks.org/?s=${encoded})`,
        `- [LeetCode company tag](https://leetcode.com/company/${slug})`,
        `- [LeetCode interview discussions](https://leetcode.com/discuss/interview-experience?query=${encodeURIComponent(company)})`,
        `- [Reddit search](https://www.reddit.com/search?q=${encoded})`,
        `- [Medium articles](https://medium.com/search?q=${encoded})`,
        '',
        '## To re-enable AI research',
        '',
        '1. Deploy `services/scraping-service` (Railway, Render, Fly.io, or any Docker host).',
        '2. Set `PYTHON_SERVICE_URL` to that deployment URL.',
        '3. Run the search again.',
      ]
        .filter(Boolean)
        .join('\n'),
      sources_analyzed: {
        total: 0,
        gfg_articles: 0,
        leetcode_topics: 0,
        medium_articles: 0,
        reddit_posts: 0,
      },
    },
  };
}

export const GET = withErrorHandling('research:company', async (req: NextRequest) => {
  // Research burns an LLM call on the Python side, so it is behind auth.
  await requireUserId();

  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company')?.trim();
  const query = searchParams.get('query')?.trim() ?? '';

  if (!company) throw new ApiError(400, 'Company name is required');

  await connectDB();

  // Cache key is (normalized company, normalized question). Two people asking the
  // same thing about the same company share one scrape + one LLM call; MongoDB's
  // TTL index on scrapedAt expires the entry after 7 days.
  const companyName = company.toLowerCase();
  const queryKey = query.toLowerCase();

  const cached = await Company.findOne({ companyName, queryKey }).lean();

  if (cached) {
    return NextResponse.json({ ...(cached.data as object), cached: true });
  }

  let data: unknown;

  try {
    const response = await fetch(
      `${serviceUrl()}/research/company?company=${encodeURIComponent(company)}&query=${encodeURIComponent(query)}&platforms=gfg,leetcode,medium`,
      {
        headers: { 'Content-Type': 'application/json' },
        // Bounded wait: without a signal a hung service would hold the function
        // open until the platform's own timeout kills it.
        signal: AbortSignal.timeout(SERVICE_TIMEOUT_MS),
      }
    );

    if (!response.ok) throw new Error(`Research service returned ${response.status}`);

    data = await response.json();
  } catch (error) {
    console.warn('[research:company] falling back:', error);
    // Deliberately NOT cached — the next request should retry the real service.
    return NextResponse.json(fallbackInsights(company, query));
  }

  await Company.findOneAndUpdate(
    { companyName, queryKey },
    { companyName, queryKey, data, scrapedAt: new Date() },
    { upsert: true }
  );

  return NextResponse.json({ ...(data as object), cached: false });
});
