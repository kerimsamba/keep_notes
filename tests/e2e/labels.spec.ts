import { test, expect } from '@playwright/test';

test.describe('Label Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume user is authenticated
  });

  test.skip('should open label manager', async ({ page }) => {
    // Click label manager button
    await page.getByTitle('Manage labels').click();

    // Label manager modal should open
    await expect(page.getByText('Manage Labels')).toBeVisible();
  });

  test.skip('should create a new label', async ({ page }) => {
    // Open label manager
    await page.getByTitle('Manage labels').click();

    // Fill in label name
    await page.getByPlaceholder('Label name').fill('Important');

    // Select a color
    await page.locator('button[style*="background-color: rgb(239, 68, 68)"]').first().click();

    // Submit
    await page.getByRole('button').filter({ has: page.locator('svg[class*="lucide-plus"]') }).click();

    // Label should appear in list
    await expect(page.getByText('Important')).toBeVisible();
  });

  test.skip('should edit a label', async ({ page }) => {
    // Open label manager
    await page.getByTitle('Manage labels').click();

    // Click edit on a label
    const labelRow = page.getByText('Important').locator('..');
    await labelRow.getByTitle('Edit').click();

    // Change name
    const nameInput = labelRow.getByRole('textbox');
    await nameInput.clear();
    await nameInput.fill('Very Important');

    // Save changes
    await labelRow.locator('button').filter({ has: page.locator('svg[class*="lucide-plus"]') }).click();

    // Updated label should appear
    await expect(page.getByText('Very Important')).toBeVisible();
  });

  test.skip('should delete a label', async ({ page }) => {
    // Open label manager
    await page.getByTitle('Manage labels').click();

    // Click delete on a label
    const labelRow = page.getByText('Important').locator('..');

    // Mock confirm dialog
    page.on('dialog', dialog => dialog.accept());

    await labelRow.getByTitle('Delete').click();

    // Label should be removed
    await expect(page.getByText('Important')).not.toBeVisible();
  });

  test.skip('should close label manager', async ({ page }) => {
    // Open label manager
    await page.getByTitle('Manage labels').click();

    // Close button
    await page.getByRole('button').filter({ has: page.locator('svg[class*="lucide-x"]') }).first().click();

    // Modal should close
    await expect(page.getByText('Manage Labels')).not.toBeVisible();
  });
});

test.describe('Label Filtering', () => {
  test.skip('should filter notes by label', async ({ page }) => {
    await page.goto('/');

    // Click on a label in sidebar
    await page.getByText('Important').click();

    // Should show filtered indicator
    await expect(page.getByText('Filtered by:')).toBeVisible();
    await expect(page.getByText('Important')).toBeVisible();

    // Only notes with that label should be visible
    // This would need to verify specific notes based on test data
  });

  test.skip('should clear label filter', async ({ page }) => {
    await page.goto('/');

    // Apply filter
    await page.getByText('Important').click();

    // Clear filter
    await page.locator('button').filter({ hasText: '✕' }).click();

    // Filter should be cleared
    await expect(page.getByText('Filtered by:')).not.toBeVisible();
  });
});

test.describe('Note Labels', () => {
  test.skip('should add label to note', async ({ page }) => {
    await page.goto('/');

    // Open note editor
    await page.getByRole('button', { name: 'New Note' }).click();

    // Fill in note
    await page.getByPlaceholder('Title').fill('Labeled Note');
    await page.getByPlaceholder('Take a note...').fill('This note has labels');

    // Click label button
    await page.getByTitle('Add label').hover();

    // Select a label
    await page.getByText('Important').click();

    // Label should be added
    await expect(page.locator('.inline-flex').filter({ hasText: 'Important' })).toBeVisible();

    // Save note
    await page.getByRole('button', { name: 'Save' }).click();
  });

  test.skip('should remove label from note', async ({ page }) => {
    await page.goto('/');

    // Open note with label
    await page.getByText('Labeled Note').click();

    // Remove label
    const labelBadge = page.locator('.inline-flex').filter({ hasText: 'Important' });
    await labelBadge.locator('button').click();

    // Label should be removed
    await expect(labelBadge).not.toBeVisible();

    // Save changes
    await page.getByRole('button', { name: 'Update' }).click();
  });

  test.skip('should display labels on note cards', async ({ page }) => {
    await page.goto('/');

    // Find note with labels
    const noteCard = page.getByText('Labeled Note').locator('..');

    // Labels should be visible on card
    await expect(noteCard.locator('.inline-flex').filter({ hasText: 'Important' })).toBeVisible();
  });
});
