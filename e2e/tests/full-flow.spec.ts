import { test, expect } from '@playwright/test';

test.describe('ReviewPilot End-to-End User Journey', () => {
  const uniqueEmail = `developer-${Date.now()}@reviewpilot.test`;
  const password = 'StrongPassword123!';

  test('Full flow: Register -> Create Review -> Accept Finding -> Check Precision Stat', async ({
    page,
  }) => {
    // 1. Visit Register Page
    await page.goto('/register');
    await expect(page).toHaveTitle(/ReviewPilot/i);

    // 2. Register Account
    await page.fill('[data-testid="register-email-input"]', uniqueEmail);
    await page.fill('[data-testid="register-password-input"]', password);
    await page.fill('[data-testid="register-confirm-password-input"]', password);
    await page.click('[data-testid="register-submit-btn"]');

    // 3. Verify Landing on Dashboard
    await page.waitForURL('**/');
    await expect(page.locator('h1')).toContainText('Code Review Dashboard');
    await expect(page.locator('#stats-precision-val')).toBeVisible();

    // 4. Click New Code Review
    await page.click('[data-testid="dashboard-new-review-btn"]');
    await page.waitForURL('**/new');
    await expect(page.locator('h1')).toContainText('Create New Code Review');

    // 5. Load Sample Vulnerable Diff and Submit
    await page.click('#load-sample-diff-btn');
    await expect(page.locator('[data-testid="diff-textarea"]')).not.toBeEmpty();

    await page.click('[data-testid="submit-review-btn"]');

    // 6. Wait for Review to complete and load findings
    await page.waitForURL(/\/reviews\/[0-9a-f-]+/, { timeout: 30000 });
    await expect(page.locator('h1')).toBeVisible();

    // Verify findings cards are rendered
    const firstFindingCard = page.locator('[data-testid^="finding-card-"]').first();
    await expect(firstFindingCard).toBeVisible();

    // 7. Accept the First Finding
    const acceptBtn = firstFindingCard.locator('[data-testid^="accept-btn-"]');
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    // Verify feedback status updates to Accepted
    await expect(firstFindingCard).toContainText('Accepted (True Positive)');

    // 8. Return to Dashboard and Verify AI Precision Stat
    await page.goto('/');
    await expect(page.locator('#stats-precision-val')).toContainText('100%');
  });
});
