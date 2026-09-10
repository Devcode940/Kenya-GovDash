import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isAuthenticated } from '@/lib/auth';

const execAsync = promisify(exec);

// POST /api/admin/refresh-parliament (AUTH REQUIRED)
// Triggers a full re-scrape of parliament.go.ke for MPs, Senators, and Woman Reps.
export async function POST(_request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const REFRESH_SCRIPT = '/home/z/my-project/scripts/refresh_parliament_data.sh';
    const TIMEOUT_MS = 10 * 60 * 1000;

    const { stdout } = await execAsync(`bash ${REFRESH_SCRIPT}`, {
      timeout: TIMEOUT_MS,
      maxBuffer: 5 * 1024 * 1024,
      env: { ...process.env, PATH: `/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}` },
    });

    const logLines = stdout.split('\n').filter(Boolean);
    const summaryLines = logLines.filter(l => l.includes('✓') || l.includes('✗'));

    return NextResponse.json({
      success: true,
      message: 'Parliament data refreshed successfully',
      ranAt: new Date().toISOString(),
      summary: summaryLines,
      output: stdout.slice(-2000),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error', ranAt: new Date().toISOString() }, { status: 500 });
  }
}

// GET — endpoint info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/refresh-parliament',
    method: 'POST (requires auth)',
    description: 'Triggers a full re-scrape of parliament.go.ke for MPs, Senators, and Woman Reps.',
  });
}
