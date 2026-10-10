import { NextResponse } from 'next/server';
import { requestCapture } from '../heartbeat/route';

// In-memory screenshot storage (single user, single screenshot at a time)
let latestScreenshot: string | null = null;
let screenshotTimestamp: string | null = null;
let captureStatus: 'idle' | 'pending' | 'ready' = 'idle';

export async function POST() {
  // Mobile app requests a capture
  requestCapture();
  captureStatus = 'pending';
  latestScreenshot = null;
  screenshotTimestamp = null;

  return NextResponse.json({
    status: 'capture_requested',
    message: 'Screenshot capture signal sent to desktop agent.',
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
