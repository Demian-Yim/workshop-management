import { test, expect } from '@playwright/test';

test.describe('관리자 로그인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // React 하이드레이션 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('로그인 폼이 올바르게 표시된다', async ({ page }) => {
    await expect(page.getByText('관리자 로그인')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /^로그인$/ })).toBeVisible();
  });

  test('빈 폼 제출 시 에러 메시지가 표시된다', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /^로그인$/ });
    // 버튼이 활성화(hydration 완료) 상태인지 확인 후 클릭
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    await expect(
      page.getByText('이메일과 비밀번호를 입력하세요')
    ).toBeVisible({ timeout: 5000 });
  });

  test('잘못된 자격 증명으로 에러 메시지가 표시된다', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /^로그인$/ });
    await expect(loginButton).toBeEnabled();

    await page.locator('input[type="email"]').fill('invalid@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await loginButton.click();

    // 로그인 중... 텍스트가 표시되었다가 에러 메시지로 전환됨
    await expect(
      page.getByText(/실패/)
    ).toBeVisible({ timeout: 30000 });
  });

  test('비밀번호 찾기 버튼이 존재한다', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /비밀번호.*잊으셨/ })
    ).toBeVisible();
  });
});
