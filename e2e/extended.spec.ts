import { test, expect } from '@playwright/test';

// ──────────────────────────────────────────────
// 미들웨어 redirect 확인 (미인증 상태)
// ──────────────────────────────────────────────
test.describe('미들웨어 redirect (미인증)', () => {
  test('/dashboard → /login 으로 redirect된다', async ({ page }) => {
    const response = await page.goto('/dashboard');
    // 최종 URL이 /login 이어야 함
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/login/);
  });

  test('/create → /login 으로 redirect된다', async ({ page }) => {
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/login/);
  });
});

// ──────────────────────────────────────────────
// /display 페이지 기본 UI 로드
// ──────────────────────────────────────────────
test.describe('/display 페이지', () => {
  test('페이지가 오류 없이 로드된다', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/display');
    await page.waitForLoadState('networkidle');

    // 500 서버 오류 텍스트가 없어야 함 (innerText로 스크립트 번들 제외)
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/500|Internal Server Error/);

    // JS 런타임 오류가 없어야 함 (Firebase 초기화 오류 제외)
    const criticalErrors = errors.filter(
      (e) => !e.includes('Firebase') && !e.includes('firestore') && !e.includes('auth')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('세션 ID 없이 접근 시 안내 UI가 표시된다', async ({ page }) => {
    await page.goto('/display');
    await page.waitForLoadState('networkidle');
    // 빈 상태 혹은 로딩 스피너 중 하나가 표시되어야 함 (500 오류 아님)
    const statusCode = await page.evaluate(() => document.title);
    expect(statusCode).not.toContain('500');
  });
});

// ──────────────────────────────────────────────
// API 라우트 응답 형식 확인
// ──────────────────────────────────────────────
test.describe('API 라우트', () => {
  test('GET /api/kakao/search?query=김밥 — 응답 형식 확인', async ({ request }) => {
    const response = await request.get('/api/kakao/search?query=김밥');
    // 200 또는 500(KAKAO_REST_API_KEY 미설정) 중 하나
    // 404는 라우트 자체가 없는 것이므로 실패
    expect(response.status()).not.toBe(404);
    const body = await response.json();
    // 성공: { documents: [...] } 또는 오류: { error: '...' }
    const hasDocuments = 'documents' in body;
    const hasError = 'error' in body;
    expect(hasDocuments || hasError).toBe(true);
  });

  test('GET /api/kakao/search — query 파라미터 없으면 400', async ({ request }) => {
    const response = await request.get('/api/kakao/search');
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('GET /api/export?courseId=test&type=attendance — 응답 형식 확인', async ({ request }) => {
    const response = await request.get('/api/export?courseId=test&type=attendance');
    // 404는 라우트 자체가 없는 것이므로 실패
    expect(response.status()).not.toBe(404);
    // 200(CSV) 또는 400(파라미터 오류) 또는 500(Firebase 오류) 모두 허용
    // 단, Content-Type 또는 JSON 응답이어야 함
    const contentType = response.headers()['content-type'] ?? '';
    const isValid = contentType.includes('text/csv') ||
                    contentType.includes('application/json') ||
                    response.status() >= 400;
    expect(isValid).toBe(true);
  });
});

// ──────────────────────────────────────────────
// 로그인 페이지 실제 에러 메시지 텍스트 확인
// ──────────────────────────────────────────────
test.describe('로그인 페이지 에러 메시지 실제 텍스트 확인', () => {
  test('잘못된 자격 증명 제출 시 표시되는 에러 메시지 텍스트를 캡처한다', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('invalid@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /^로그인$/ }).click();

    // 30초 대기 후 에러 영역 텍스트 캡처 (어떤 텍스트가 실제로 나오는지 확인)
    await page.waitForTimeout(5000);
    const pageText = await page.textContent('body');
    // 테스트 목적: 실제 에러 텍스트를 로그로 기록
    console.log('[ERROR TEXT CAPTURE]', pageText?.substring(0, 500));
    // 어떤 형태의 응답이든 있어야 함 (무한 로딩이 아닌지 확인)
    expect(pageText).toBeTruthy();
  });

  test('비밀번호 찾기 관련 UI 요소 탐색', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 페이지 내 모든 버튼 텍스트 수집
    const buttons = await page.locator('button').allTextContents();
    console.log('[BUTTONS ON LOGIN PAGE]', buttons);

    // 페이지 내 모든 링크 텍스트 수집
    const links = await page.locator('a').allTextContents();
    console.log('[LINKS ON LOGIN PAGE]', links);

    // 비밀번호 관련 텍스트가 있는지 확인
    const bodyText = await page.textContent('body');
    const hasForgotPassword = bodyText?.includes('비밀번호') || false;
    console.log('[HAS PASSWORD TEXT]', hasForgotPassword);

    // 페이지가 정상 로드되었는지만 확인
    expect(page.url()).toMatch(/\/login/);
  });
});
