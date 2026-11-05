import { NextRequest, NextResponse } from 'next/server';

// In-memory state for PC agent connection
// In production, use Redis or a database. For single-user, this is fine.
let lastHeartbeat: number = 0;
let captureRequested: boolean = false;
let pendingTargetMonitor: string = 'laptop';
let connectedMonitors: Array<{ id: string; name: string }> = [];

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      token: string;
      monitors?: Array<{ id: string; name: string }>;
    };
    const expectedToken = process.env.WINSTON_PAIRING_TOKEN || 'winston-kongad-2027';

    if (body.token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid pairing token' }, { status: 401 });
    }

    lastHeartbeat = Date.now();
    if (body.monitors && Array.isArray(body.monitors)) {
      connectedMonitors = body.monitors;
    }

    const response = {
      status: 'ok',
      capture_requested: captureRequested,
      target_monitor: captureRequested ? pendingTargetMonitor : undefined,
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
    monitors: connectedMonitors,
  });
}

// Export for use by capture route
export function requestCapture(targetMonitor: string = 'laptop') {
  captureRequested = true;
  pendingTargetMonitor = targetMonitor;
}

export function isAgentOnline(): boolean {
  return (Date.now() - lastHeartbeat) < 10000;
}
