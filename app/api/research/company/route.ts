// app/api/research/company/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const query = searchParams.get('query') || '';

    if (!company) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    const response = await fetch(
      `${PYTHON_SERVICE_URL}/research/company?company=${encodeURIComponent(company)}&query=${encodeURIComponent(query)}&platforms=reddit,gfg,leetcode`,
      {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(90000), // 90 second timeout for AI processing
      }
    );

    if (!response.ok) {
      throw new Error(`Service returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete research' },
      { status: 500 }
    );
  }
}
