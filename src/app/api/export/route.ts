import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const sessionId = searchParams.get('sessionId');
  const type = searchParams.get('type') || 'attendance';

  if (!courseId || !sessionId) {
    return NextResponse.json({ error: 'Missing courseId or sessionId' }, { status: 400 });
  }

  // CSV headers based on export type
  const headers: Record<string, string[]> = {
    attendance: ['이름', '체크인시간', '상태'],
    posts: ['작성자', '내용', '좋아요수', '작성시간'],
    survey: ['참가자', '전체평균', '의견', '제출시간'],
    reviews: ['작성자', '별점', '내용', '작성시간'],
    lunch: ['참가자', '선택메뉴', '투표시간'],
  };

  const csvHeaders = headers[type] || headers.attendance;
  const bom = '\uFEFF';
  const csvContent = bom + csvHeaders.join(',') + '\n' + '(데이터는 Firestore에서 서버사이드로 로드해야 합니다)\n';

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type}_export_${sessionId}.csv"`,
    },
  });
}
