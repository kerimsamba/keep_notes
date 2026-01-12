import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display auth page for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('KeepClone');
    await expect(page.getByText('Your notes, organized and synced')).toBeVisible();
  });

  test('should show login and signup tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should switch between login and signup tabs', async ({ page }) => {
    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    await signUpTab.click();

    // Should show name field on signup
    await expect(page.getByPlaceholder('Your name')).toBeVisible();

    const signInTab = page.getByRole('button', { name: 'Sign In' });
    await signInTab.click();

    // Name field should not be visible on signin
    await expect(page.getByPlaceholder('Your name')).not.toBeVisible();
  });

  test('should validate email field', async ({ page }) => {
    const emailInput = page.getByPlaceholder('your@email.com');
    const passwordInput = page.getByPlaceholder('••••••••');
    const submitButton = page.getByRole('button', { name: 'Sign In', exact: true });

    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();

    // HTML5 validation should prevent submission
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should validate password length', async ({ page }) => {
    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    await signUpTab.click();

    const nameInput = page.getByPlaceholder('Your name');
    const emailInput = page.getByPlaceholder('your@email.com');
    const passwordInput = page.getByPlaceholder('••••••••');
    const submitButton = page.getByRole('button', { name: 'Sign Up', exact: true });

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('12345'); // Less than 6 characters
    await submitButton.click();

    // Should not proceed due to minLength validation
    await expect(passwordInput).toHaveAttribute('minLength', '6');
  });

  test('should display Google sign-in button', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test('should show loading state during authentication', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });

    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByPlaceholder('••••••••').fill('password123');

    // Mock slow network to see loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await signInButton.click();

    // Button should show loading text
    await expect(signInButton).toBeDisabled();
  });
});

test.describe('Authentication Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display error for missing fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Sign In', exact: true });
    await submitButton.click();

    // HTML5 required validation should prevent submission
    const emailInput = page.getByPlaceholder('your@email.com');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should clear error when switching tabs', async ({ page }) => {
    // Trigger an error on sign in
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByPlaceholder('••••••••').fill('wrong');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Switch to sign up tab
    const signUpTab = page.getByRole('button', { name: 'Sign Up' });
    await signUpTab.click();

    // Error should be cleared
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
  });
});
