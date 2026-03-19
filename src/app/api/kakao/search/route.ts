import { NextRequest, NextResponse } from 'next/server';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(request: NextRequest) {
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
