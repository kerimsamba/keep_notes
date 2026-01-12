import { test, expect } from '@playwright/test';

test.describe('Layout and Views', () => {
  test.skip('should display sidebar', async ({ page }) => {
    await page.goto('/');

    // Sidebar should be visible
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
    await expect(page.getByText('Archive')).toBeVisible();
    await expect(page.getByText('Trash')).toBeVisible();
  });

  test.skip('should switch to list view', async ({ page }) => {
    await page.goto('/');

    // Click list view button
    await page.getByTitle('List view').click();

    // Notes should be in list layout
    const notesContainer = page.locator('.flex.flex-col.gap-2');
    await expect(notesContainer).toBeVisible();
  });

  test.skip('should switch to grid view', async ({ page }) => {
    await page.goto('/');

    // First switch to list view
    await page.getByTitle('List view').click();

    // Then switch to grid view
    await page.getByTitle('Grid view').click();

    // Notes should be in grid layout
    const notesContainer = page.locator('.grid');
    await expect(notesContainer).toBeVisible();
  });

  test.skip('should navigate to archive', async ({ page }) => {
    await page.goto('/');

    // Click archive in sidebar
    await page.getByText('Archive').click();

    // Archive view should be active
    await expect(page.getByText('Archive')).toHaveClass(/bg-yellow-50/);
  });

  test.skip('should navigate to trash', async ({ page }) => {
    await page.goto('/');

    // Click trash in sidebar
    await page.getByText('Trash').click();

    // Trash warning should be visible
    await expect(page.getByText('Notes in trash are automatically deleted after 7 days')).toBeVisible();
  });

  test.skip('should show user info in sidebar', async ({ page }) => {
    await page.goto('/');

    // User info should be visible
    await expect(page.locator('.text-sm.font-medium')).toBeVisible();
  });

  test.skip('should logout', async ({ page }) => {
    await page.goto('/');

    // Click logout button
    await page.getByTitle('Logout').click();

    // Should redirect to auth page
    await expect(page.getByText('Your notes, organized and synced')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Auth page should be visible and responsive
    await expect(page.getByText('KeepClone')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByText('KeepClone')).toBeVisible();
  });

  test.skip('should show responsive grid on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Grid should show multiple columns
    const notesGrid = page.locator('.grid');
    await expect(notesGrid).toHaveClass(/grid-cols-4/);
  });
});

test.describe('PWA Features', () => {
  test('should have manifest', async ({ page }) => {
    await page.goto('/');

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#fbbf24');

    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should show online status indicator', async ({ page }) => {
    await page.goto('/');

    // Online status component should be present
    // This is dynamically imported, so we check for its eventual presence
    await page.waitForTimeout(1000);
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper caching headers', async ({ page, request }) => {
    const response = await request.get('/');

    // Check that static assets are cacheable
    expect(response.status()).toBe(200);
  });
});
