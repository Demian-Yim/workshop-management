import { test, expect } from '@playwright/test';

test.describe('홈 페이지', () => {
  test('3개 역할 카드가 표시되고 올바른 링크를 가진다', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/워크샵/);

    // 3개 역할 카드 확인
    const learnerLink = page.locator('a[href="/join"]');
    const facilitatorLink = page.locator('a[href="/create"]');
    const adminLink = page.locator('a[href="/login"]');

    await expect(learnerLink).toBeVisible();
    await expect(facilitatorLink).toBeVisible();
    await expect(adminLink).toBeVisible();

    // 역할 텍스트 확인
    await expect(learnerLink).toContainText('학습자');
    await expect(facilitatorLink).toContainText('강사');
    await expect(adminLink).toContainText('관리자');
  });

  test('학습자 카드 클릭 시 /join으로 이동', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/join"]').click();
    await expect(page).toHaveURL(/\/join/);
  });

  test('관리자 카드 클릭 시 /login으로 이동', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/login"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
