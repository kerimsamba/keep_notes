import { test, expect } from '@playwright/test';

test.describe('GitHub setup screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show the setup page when no repo is connected', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Keep Notes');
    await expect(page.getByText('Connect a GitHub repository')).toBeVisible();
  });

  test('should have token, repo, and branch fields', async ({ page }) => {
    await expect(page.getByPlaceholder('github_pat_...')).toBeVisible();
    await expect(page.getByPlaceholder('your-username/my-notes')).toBeVisible();
    await expect(page.getByPlaceholder('main')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
  });

  test('should show an error for an invalid token', async ({ page }) => {
    await page.getByPlaceholder('github_pat_...').fill('github_pat_invalid');
    await page.getByPlaceholder('your-username/my-notes').fill('nobody/does-not-exist');
    await page.getByRole('button', { name: 'Connect' }).click();
    // 401 from GitHub for a bad token
    await expect(page.getByText(/rejected the token|not found|Could not/i)).toBeVisible({
      timeout: 15000,
    });
  });
});
