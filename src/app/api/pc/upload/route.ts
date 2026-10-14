import { NextRequest, NextResponse } from 'next/server';
import { setScreenshot } from '../capture/route';

interface UploadBody {
  token: string;
  image: string;
  timestamp: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: UploadBody = await request.json();
    const expectedToken = process.env.WINSTON_PAIRING_TOKEN || 'winston-kongad-2027';

    if (body.token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid pairing token' }, { status: 401 });
    }

    if (!body.image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    setScreenshot(body.image, body.timestamp);

    return NextResponse.json({
      status: 'received',
      message: 'Screenshot uploaded successfully.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
