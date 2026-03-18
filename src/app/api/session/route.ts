import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, sessionId, title, date, dayNumber } = body;

    if (!courseId || !sessionId) {
      return NextResponse.json({ error: 'Missing courseId or sessionId' }, { status: 400 });
    }

    // Generate 4-digit session code
    const sessionCode = Math.floor(1000 + Math.random() * 9000).toString();

    return NextResponse.json({
      success: true,
      sessionCode,
      courseId,
      sessionId,
      title,
      date,
      dayNumber,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Session code required' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    code,
    message: 'Session code validation should be done via Firestore client-side for real-time capability',
  });
}
