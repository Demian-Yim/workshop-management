import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query } from 'firebase/firestore';

type ExportType = 'attendance' | 'posts' | 'survey' | 'reviews' | 'lunch';

const HEADERS: Record<ExportType, string[]> = {
  attendance: ['이름', '체크인시간', '상태'],
  posts: ['작성자', '내용', '좋아요수', '작성시간'],
  survey: ['참가자', '전체평균', '의견', '제출시간'],
  reviews: ['작성자', '별점', '내용', '작성시간'],
  lunch: ['참가자', '선택메뉴', '투표시간'],
};

const COLLECTION_MAP: Record<ExportType, string> = {
  attendance: 'attendance',
  posts: 'posts',
  survey: 'surveyResponses',
  reviews: 'reviews',
  lunch: 'lunchVotes',
};

function escapeCSV(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatTimestamp(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return String(ts);
}

function docToRow(type: ExportType, data: Record<string, unknown>): string[] {
  switch (type) {
    case 'attendance':
      return [
        escapeCSV(data.participantName),
        escapeCSV(formatTimestamp(data.checkedInAt)),
        escapeCSV(data.status ?? 'checked-in'),
      ];
    case 'posts':
      return [
        escapeCSV(data.authorName ?? data.participantName),
        escapeCSV(data.content),
        escapeCSV(data.likeCount ?? data.likes ?? 0),
        escapeCSV(formatTimestamp(data.createdAt)),
      ];
    case 'survey':
      return [
        escapeCSV(data.participantName),
        escapeCSV(data.averageScore ?? data.overall ?? ''),
        escapeCSV(data.comment ?? data.feedback ?? ''),
        escapeCSV(formatTimestamp(data.submittedAt ?? data.createdAt)),
      ];
    case 'reviews':
      return [
        escapeCSV(data.authorName ?? data.participantName),
        escapeCSV(data.rating ?? data.score ?? ''),
        escapeCSV(data.content ?? data.comment ?? ''),
        escapeCSV(formatTimestamp(data.createdAt)),
      ];
    case 'lunch':
      return [
        escapeCSV(data.participantName),
        escapeCSV(data.selectedMenu ?? data.optionName ?? ''),
        escapeCSV(formatTimestamp(data.votedAt ?? data.createdAt)),
      ];
    default:
      return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const sessionId = searchParams.get('sessionId');
  const type = (searchParams.get('type') || 'attendance') as ExportType;

  if (!courseId || !sessionId) {
    return NextResponse.json({ error: 'Missing courseId or sessionId' }, { status: 400 });
  }

  const csvHeaders = HEADERS[type] || HEADERS.attendance;
  const collectionName = COLLECTION_MAP[type] || type;
  const basePath = `courses/${courseId}/sessions/${sessionId}/${collectionName}`;

  try {
    const q = query(collection(db, basePath));
    const snapshot = await getDocs(q);

    const rows: string[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      rows.push(docToRow(type, data).join(','));
    });

    const bom = '\uFEFF';
    const csvContent = bom + csvHeaders.join(',') + '\n' + rows.join('\n') + '\n';

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_export_${sessionId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
