import { test, expect } from '@playwright/test';

test.describe('Alik vs Sahko — Game Smoke & Accessibility E2E', () => {
	test('renders battle arena canvas and core HUD controls', async ({ page }) => {
		await page.goto('/');

		// Verify game canvas is visible and accessible
		const canvas = page.locator('canvas');
		await expect(canvas).toBeVisible();
		await expect(canvas).toHaveAttribute('aria-label');

		// Verify HUD status elements (lives, wave)
		await expect(page.locator('body')).toContainText(/Хвиля|Wave/i);

		// Verify ARIA Live region exists for screen reader announcements
		const liveRegion = page.locator('[aria-live="polite"]');
		await expect(liveRegion).toBeAttached();
	});

	test('handles 404 route with themed error boundary', async ({ page }) => {
		const res = await page.goto('/non-existent-sector');
		expect(res?.status()).toBe(404);
		await expect(page.locator('h1')).toContainText(/СЕКТОР НЕ ЗНАЙДЕНО|OUT OF BOUNDS/i);
		await expect(page.locator('a')).toBeVisible();
	});
});
