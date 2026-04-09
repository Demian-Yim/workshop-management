import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY;
const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Warn at startup if no provider is configured — ops can catch this in logs.
if (!NANOBANANA_API_KEY && !GEMINI_API_KEY) {
  console.warn('[character/generate] No provider configured: NANOBANANA_API_KEY and GEMINI_API_KEY are both missing. Character generation will fail.');
}
if (NANOBANANA_API_KEY && !NANOBANANA_API_URL) {
  console.warn('[character/generate] NANOBANANA_API_KEY is set but NANOBANANA_API_URL is missing. NanoBanana provider will be skipped.');
}

interface GenerateRequest {
  imageBase64: string;
  style: 'cartoon' | 'anime' | 'pixel';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`character:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  let body: GenerateRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const { imageBase64, style } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: '이미지가 필요합니다' }, { status: 400 });
  }

  if (!style || !['cartoon', 'anime', 'pixel'].includes(style)) {
    return NextResponse.json({ error: '유효한 스타일을 선택해주세요' }, { status: 400 });
  }

  // Try NanoBanana Pro first
  if (NANOBANANA_API_KEY && NANOBANANA_API_URL) {
    try {
      const result = await generateWithNanoBanana(imageBase64, style);
      if (result) {
        return NextResponse.json({
          success: true,
          characterImageBase64: result,
          provider: 'nanobanana',
        });
      }
      console.warn('[character/generate] NanoBanana returned no image data (style=%s)', style);
    } catch (error) {
      console.error('[character/generate] NanoBanana provider failed:', {
        style,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else if (!NANOBANANA_API_KEY) {
    console.info('[character/generate] Skipping NanoBanana: NANOBANANA_API_KEY not set');
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      const result = await generateWithGemini(imageBase64, style);
      if (result) {
        return NextResponse.json({
          success: true,
          characterImageBase64: result,
          provider: 'gemini',
        });
      }
      console.warn('[character/generate] Gemini returned no image data (style=%s)', style);
    } catch (error) {
      console.error('[character/generate] Gemini provider failed:', {
        style,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    console.info('[character/generate] Skipping Gemini: GEMINI_API_KEY not set');
  }

  console.error('[character/generate] All providers exhausted — returning 503', { style });
  return NextResponse.json(
    {
      success: false,
      characterImageBase64: null,
      error: 'API 키가 설정되지 않았거나 캐릭터 생성에 실패했습니다',
    },
    { status: 503 }
  );
}

async function generateWithNanoBanana(
  imageBase64: string,
  style: string
): Promise<string | null> {
  const response = await fetch(NANOBANANA_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NANOBANANA_API_KEY}`,
    },
    body: JSON.stringify({
      image: imageBase64,
      style,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NanoBanana HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.image || data.result || null;
}

async function generateWithGemini(
  imageBase64: string,
  style: string
): Promise<string | null> {
  const stylePrompts: Record<string, string> = {
    cartoon: 'a cute cartoon character avatar',
    anime: 'an anime-style character avatar',
    pixel: 'a pixel art character avatar',
  };

  const prompt = `Based on this person's photo, create ${stylePrompts[style] || stylePrompts.cartoon}.
Keep the key facial features recognizable but stylized.
Output only the generated character image.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
          responseMimeType: 'image/png',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    if (part.inline_data?.data) {
      return part.inline_data.data;
    }
  }

  return null;
}
