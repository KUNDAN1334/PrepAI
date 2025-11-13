// app/api/scrape/company/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const platforms = searchParams.get('platforms') || 'reddit,leetcode,gfg,medium';

    if (!company) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    try {
      // Try to call Python service
      const response = await fetch(
        `${PYTHON_SERVICE_URL}/scrape/company?company=${encodeURIComponent(company)}&platforms=${platforms}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`Python service returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Python service error:', fetchError.message);
      
      // Return fallback data with URLs (works without Python service)
      return NextResponse.json({
        company,
        scraped_at: new Date().toISOString(),
        platforms: generateFallbackData(company, platforms.split(',')),
        note: 'Python scraping service unavailable. Showing direct links instead.',
      });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scrape data' },
      { status: 500 }
    );
  }
}

function generateFallbackData(company: string, platforms: string[]) {
  const fallbackData: any = {};
  
  platforms.forEach(platform => {
    switch (platform) {
      case 'reddit':
        fallbackData.reddit = {
          posts: [],
          message: 'Reddit scraping requires Python service. Visit Reddit directly.',
          search_url: `https://www.reddit.com/search?q=${encodeURIComponent(company + ' interview')}`,
        };
        break;
      case 'leetcode':
        fallbackData.leetcode = {
          discuss_url: `https://leetcode.com/discuss/interview-experience?currentPage=1&orderBy=hot&query=${company}`,
          company_tag: `https://leetcode.com/company/${company.toLowerCase().replace(/\s+/g, '-')}`,
          message: 'Visit LeetCode to view interview experiences',
        };
        break;
      case 'gfg':
        fallbackData.gfg = {
          experience_url: `https://www.geeksforgeeks.org/${company.toLowerCase().replace(/\s+/g, '-')}-interview-experience/`,
          search_url: `https://www.geeksforgeeks.org/?s=${company}+interview`,
          message: 'Visit GeeksforGeeks to read interview experiences',
        };
        break;
      case 'medium':
        fallbackData.medium = {
          search_url: `https://medium.com/search?q=${encodeURIComponent(company + ' interview experience')}`,
          tag_url: `https://medium.com/tag/${company.toLowerCase().replace(/\s+/g, '-')}`,
          message: 'Visit Medium to read articles',
        };
        break;
      case 'twitter':
        fallbackData.twitter = {
          search_url: `https://twitter.com/search?q=${encodeURIComponent(company + ' (interview OR hiring OR culture)')}`,
          message: 'Visit Twitter to view tweets',
        };
        break;
      case 'linkedin':
        fallbackData.linkedin = {
          company_page: `https://www.linkedin.com/company/${company.toLowerCase().replace(/\s+/g, '-')}`,
          jobs_page: `https://www.linkedin.com/jobs/search?keywords=${company}`,
          message: 'Visit LinkedIn for company info and jobs',
        };
        break;
    }
  });
  
  return fallbackData;
}
