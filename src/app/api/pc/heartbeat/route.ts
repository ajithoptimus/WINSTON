import { NextRequest, NextResponse } from 'next/server';

// In-memory state for PC agent connection
// In production, use Redis or a database. For single-user, this is fine.
let lastHeartbeat: number = 0;
let captureRequested: boolean = false;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token: string };
    const expectedToken = process.env.WINSTON_PAIRING_TOKEN || 'winston-kongad-2027';

    if (body.token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid pairing token' }, { status: 401 });
    }

    lastHeartbeat = Date.now();

    const response = {
      status: 'ok',
      capture_requested: captureRequested,
    };

    // Reset capture flag after sending it to the agent
    if (captureRequested) {
      captureRequested = false;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  const isOnline = (Date.now() - lastHeartbeat) < 10000; // Online if heartbeat within last 10s
  return NextResponse.json({
    online: isOnline,
    lastHeartbeat: lastHeartbeat > 0 ? new Date(lastHeartbeat).toISOString() : null,
  });
}

// Export for use by capture route
export function requestCapture() {
  captureRequested = true;
}

export function isAgentOnline(): boolean {
  return (Date.now() - lastHeartbeat) < 10000;
}
