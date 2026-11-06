import { NextRequest, NextResponse } from 'next/server';
import groqClient, { CHAT_MODEL, FALLBACK_CHAT_MODEL, VISION_MODEL } from '@/lib/groq';
import { getWinstonSystemPrompt, getVisionSystemPrompt } from '@/lib/winston-prompt';

interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  language: 'english' | 'malayalam';
  screenshot?: string; // base64 image for vision analysis
  screenQuestion?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, language, screenshot, screenQuestion } = body;

    // Vision mode: analyze screenshot
    if (screenshot && screenQuestion) {
      const systemPrompt = getVisionSystemPrompt(language);

      try {
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        // Ultra-fast multimodal inference via Gemini 2.5 Flash on OpenRouter (1.6s response time)
        if (openRouterKey) {
          try {
            const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://winston.ai',
                'X-Title': 'Winston Personal AI',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: systemPrompt },
                  {
                    role: 'user',
                    content: [
                      { type: 'text', text: screenQuestion },
                      {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${screenshot}` },
                      },
                    ],
                  },
                ],
                max_tokens: 2048,
                temperature: 0.2,
              }),
            });

            if (orRes.ok) {
              const data = (await orRes.json()) as {
                choices?: Array<{ message?: { content?: string } }>;
              };
              const content = data.choices?.[0]?.message?.content;
              if (content) {
                return NextResponse.json({ response: content });
              }
            } else {
              console.warn('OpenRouter vision HTTP error:', orRes.status);
            }
          } catch (orErr) {
            console.warn('OpenRouter vision error, falling back to Groq:', orErr);
          }
        }

        // Secondary fallback to Groq vision
        const visionMessages: Array<{
          role: 'system' | 'user';
          content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
        }> = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: screenQuestion },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${screenshot}` },
              },
            ],
          },
        ];

        const visionResponse = await groqClient.chat.completions.create({
          model: VISION_MODEL,
          messages: visionMessages as Parameters<typeof groqClient.chat.completions.create>[0]['messages'],
          max_tokens: 2048,
          temperature: 0.3,
        });

        const answer = visionResponse.choices[0]?.message?.content || 'I was unable to analyze the screenshot.';
        return NextResponse.json({ response: answer });
      } catch (visErr) {
        console.error('Vision model error:', visErr);
        return NextResponse.json({
          response: 'Winston received the screen capture, but the vision neural model encountered an error.',
        });
      }
    }

    // Standard chat mode
    const systemPrompt = getWinstonSystemPrompt(language);
    const groqMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-20).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let reply = '';
    try {
      const chatResponse = await groqClient.chat.completions.create({
        model: CHAT_MODEL,
        messages: groqMessages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
      });
      reply = chatResponse.choices[0]?.message?.content || '';
    } catch (primaryErr) {
      console.warn(`Primary model ${CHAT_MODEL} failed, falling back to ${FALLBACK_CHAT_MODEL}:`, primaryErr);
      const fallbackResponse = await groqClient.chat.completions.create({
        model: FALLBACK_CHAT_MODEL,
        messages: groqMessages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
      });
      reply = fallbackResponse.choices[0]?.message?.content || '';
    }

    if (!reply) {
      reply =
        language === 'malayalam'
          ? 'ക്ഷമിക്കണം സർ, ഒരു സാങ്കേതിക തടസ്സം നേരിട്ടു.'
          : 'My apologies, Sir. I seem to have encountered a processing anomaly.';
    }

    return NextResponse.json({ response: reply });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Winston Chat Error:', errorMessage);
    return NextResponse.json(
      { error: 'Winston encountered an internal error.', details: errorMessage },
      { status: 500 }
    );
  }
}
