import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`kakao-search:${ip}`, { limit: 30, windowMs: 60_000 });
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

  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get('query');
  const x = searchParams.get('x');
  const y = searchParams.get('y');
  const radius = searchParams.get('radius') || '2000';

  if (!queryParam) {
    return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 });
  }

  if (!KAKAO_REST_API_KEY) {
    return NextResponse.json({ error: '카카오 API 키가 설정되지 않았습니다' }, { status: 500 });
  }

  const params = new URLSearchParams({
    query: queryParam,
    size: '15',
    sort: 'accuracy',
  });

  if (x && y) {
    params.set('x', x);
    params.set('y', y);
    params.set('radius', radius);
    params.set('sort', 'distance');
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `카카오 API 오류: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      places: data.documents || [],
      meta: data.meta || {},
    });
  } catch (error) {
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
