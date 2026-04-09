import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeUrl = searchParams.get('placeUrl');

  if (!placeUrl) {
    return NextResponse.json({ error: 'placeUrl 파라미터가 필요합니다' }, { status: 400 });
  }

  // place.kakao.com URL만 허용
  if (!placeUrl.startsWith('https://place.kakao.com/') && !placeUrl.startsWith('http://place.kakao.com/')) {
    return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 });
  }

  try {
    const response = await fetch(placeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ menuItems: [], message: '페이지를 불러올 수 없습니다' });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const menuItems: { name: string; price: string; description: string }[] = [];

    // 카카오 플레이스 메뉴 파싱 시도 (구조가 바뀔 수 있음)
    $('[class*="menu"] li, [class*="Menu"] li, .list_menu li').each((_, el) => {
      const name = $(el).find('[class*="name"], [class*="tit"], .name_menu').first().text().trim();
      const price = $(el).find('[class*="price"], .price_menu').first().text().trim();
      const description = $(el).find('[class*="desc"], .desc_menu').first().text().trim();

      if (name) {
        menuItems.push({ name, price, description });
      }
    });

    return NextResponse.json({
      menuItems,
      message: menuItems.length > 0 ? '메뉴를 불러왔습니다' : '메뉴를 자동으로 불러올 수 없습니다. 수동으로 입력해주세요.',
    });
  } catch (error) {
    console.error('카카오 메뉴 스크래핑 에러:', error);
    return NextResponse.json({
      menuItems: [],
      warning: '메뉴 스크래핑 중 오류가 발생했습니다',
      message: '메뉴를 자동으로 불러올 수 없습니다. 수동으로 입력해주세요.',
    });
  }
}
