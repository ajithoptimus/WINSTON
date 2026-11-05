import { NextRequest, NextResponse } from 'next/server';
import { requestCapture } from '../heartbeat/route';

// In-memory screenshot storage (single user, single screenshot at a time)
let latestScreenshot: string | null = null;
let screenshotTimestamp: string | null = null;
let captureStatus: 'idle' | 'pending' | 'ready' = 'idle';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let targetMonitor = 'laptop';
  try {
    const body = await request.json() as { monitor?: string };
    if (body?.monitor) {
      targetMonitor = body.monitor;
    }
  } catch {
    // Body is optional
  }

  // Mobile app requests a capture
  requestCapture(targetMonitor);
  captureStatus = 'pending';
  latestScreenshot = null;
  screenshotTimestamp = null;

  return NextResponse.json({
    status: 'capture_requested',
    target_monitor: targetMonitor,
    message: `Screenshot capture signal for '${targetMonitor}' sent to desktop agent.`,
  });
}

export async function GET() {
  // Mobile app polls for the capture result
  return NextResponse.json({
    status: captureStatus,
    screenshot: latestScreenshot,
    timestamp: screenshotTimestamp,
  });
}

// Called by the upload route when screenshot arrives
export function setScreenshot(base64Image: string, timestamp: string) {
  latestScreenshot = base64Image;
  screenshotTimestamp = timestamp;
  captureStatus = 'ready';
}
