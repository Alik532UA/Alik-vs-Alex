import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_PATH ?? '/Alik-vs-Alex';

test.describe('Alik vs Alex — Game Smoke & Accessibility E2E', () => {
	test('renders campaign menu and navigates into active battle arena', async ({ page }) => {
		await page.goto(`${BASE}/`);

		// Verify title and main menu presentation
		await expect(page).toHaveTitle(/Tower Defense|Останній корабель/i);
		const menuHeading = page.locator('h1');
		await expect(menuHeading).toBeVisible();

		// 1. Menu -> Loadout
		const toPrepBtn = page.getByRole('button', { name: /Підготовка/i });
		await expect(toPrepBtn).toBeVisible();
		await toPrepBtn.click();

		// 2. Loadout -> Briefing
		const toBriefingBtn = page.getByRole('button', { name: /Брифінг/i });
		await expect(toBriefingBtn).toBeVisible();
		await toBriefingBtn.click();

		// 3. Briefing -> Playing
		const toBattleBtn = page.getByRole('button', { name: /До бою/i });
		await expect(toBattleBtn).toBeVisible();
		await toBattleBtn.click();

		// Verify game canvas is visible and accessible in playing mode
		const canvas = page.locator('canvas');
		await expect(canvas).toBeVisible();
		await expect(canvas).toHaveAttribute('aria-label');

		// Verify ARIA Live region exists for screen reader announcements
		const liveRegion = page.locator('[aria-live="polite"]');
		await expect(liveRegion).toBeAttached();
	});

	test('renders initial campaign menu with accessible actions and districts', async ({ page }) => {
		await page.goto(`${BASE}/`);

		// Verify campaign action controls
		const actionButtons = page.locator('button');
		await expect(actionButtons.first()).toBeVisible();

		// Verify district cards or campaign info
		await expect(page.locator('body')).toContainText(/Кампанія|Місія/i);
	});
});
