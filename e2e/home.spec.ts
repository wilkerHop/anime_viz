import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page and display title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anime Insights/);
    await expect(page.getByRole('heading', { name: 'Anime Insights' })).toBeVisible();
  });

  test('should allow searching for a user', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Enter MAL Username...');
    await searchInput.fill('wilker');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Should redirect to /?user=wilker
    await expect(page).toHaveURL(/\/\?user=wilker/);
    await expect(page.getByText('Showing data for user: wilker')).toBeVisible();
  });

  test('should allow resetting to global view', async ({ page }) => {
    await page.goto('/?user=wilker');
    await expect(page.getByText('Showing data for user: wilker')).toBeVisible();
    
    await page.getByRole('link', { name: 'Reset to Global' }).click();
    await expect(page).toHaveURL(/[^?]*$/); // URL should not have query params
    await expect(page.getByText('Showing Global Aggregate Data')).toBeVisible();
  });
});
