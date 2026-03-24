import { test, expect } from '@playwright/test';

test.describe('학습자 참여 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
    // React 하이드레이션 + Suspense 해제 대기
    await page.waitForLoadState('networkidle');
    // Suspense 해제 후 '워크샵 참여' 제목이 보일 때까지 대기
    await expect(page.getByText('워크샵 참여')).toBeVisible({ timeout: 30000 });
  });

  test('세션 코드와 이름 입력 필드가 표시된다', async ({ page }) => {
    const codeInput = page.locator('input[placeholder="6자리 코드"]');
    await expect(codeInput).toBeVisible();

    const nameInput = page.locator('input[placeholder="홍길동"]');
    await expect(nameInput).toBeVisible();
  });

  test('참여하기 버튼이 입력 전에는 비활성화된다', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /참여하기/ });
    await expect(submitButton).toBeDisabled();
  });

  test('유효하지 않은 세션 코드로 참여 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.locator('input[placeholder="6자리 코드"]').fill('ZZZZZ9');
    await page.locator('input[placeholder="홍길동"]').fill('테스트 사용자');

    await page.getByRole('button', { name: /참여하기/ }).click();

    await expect(
      page.getByText(/유효하지 않은|오류|실패/).first()
    ).toBeVisible({ timeout: 30000 });
  });

  test('QR 코드 파라미터로 세션 코드가 자동 입력된다', async ({ page }) => {
    await page.goto('/join?code=ABC123');
    await page.waitForLoadState('networkidle');
    // QR 진입 시 제목이 'QR 스캔 완료'
    await expect(page.getByText('QR 스캔 완료')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('ABC123')).toBeVisible();
  });

  test('세션 코드가 대문자로 변환된다', async ({ page }) => {
    const codeInput = page.locator('input[placeholder="6자리 코드"]');
    await codeInput.pressSequentially('abc123');
    await expect(codeInput).toHaveValue('ABC123');
  });
});
