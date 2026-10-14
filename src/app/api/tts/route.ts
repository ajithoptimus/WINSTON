import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' [കോഡ് ഒഴിവാക്കി] ') // skip code blocks in speech
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/[*_#~>[\]]/g, ' ') // markdown formatting
    .replace(/https?:\/\/\S+/g, '') // urls
    .replace(/\s+/g, ' ')
    .trim();
}

function splitIntoChunks(text: string, maxLen: number = 180): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLen) {
        // Break long sentence by commas or words
        const words = trimmed.split(' ');
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).trim().length <= maxLen) {
            wordChunk = (wordChunk + ' ' + w).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        current = wordChunk;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string; language?: string };
    const rawText = body.text || '';
    const language = body.language === 'malayalam' ? 'ml' : 'en-GB';

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const cleaned = cleanTextForSpeech(rawText);
    const chunks = splitIntoChunks(cleaned, 180);

    // Limit to first 6 chunks (~1000 characters) to prevent excessive latency
    const limitedChunks = chunks.slice(0, 6);

    const audioBuffers: Buffer[] = [];

    for (const chunk of limitedChunks) {
      if (!chunk.trim()) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(
        chunk
      )}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 502 });
    }

    const combinedBuffer = Buffer.concat(audioBuffers);

    return new Response(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('TTS synthesis error:', error);
    return NextResponse.json({ error: 'TTS synthesis internal failure' }, { status: 500 });
  }
}
