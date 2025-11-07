import { expect, test } from '@playwright/test';

test.describe('Dark Theme', () => {
	test('should have dark background on home page', async ({ page }) => {
		await page.goto('/');
		
		// Check that body has dark background
		const body = page.locator('body');
		const bgColor = await body.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});
		
		// Dark background should be rgb values with low numbers (dark colors)
		// e.g., rgb(15, 23, 42) for slate-900
		expect(bgColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
		
		const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
		if (match) {
			const [, r, g, b] = match.map(Number);
			// All RGB values should be less than 50 for a dark theme
			expect(r).toBeLessThan(50);
			expect(g).toBeLessThan(50);
			expect(b).toBeLessThan(50);
		}
	});

	test('should have light text on dark background', async ({ page }) => {
		await page.goto('/');
		
		// Check that text elements have light color
		const heading = page.locator('h1').first();
		if (await heading.isVisible()) {
			const color = await heading.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			
			const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			if (match) {
				const [, r, g, b] = match.map(Number);
				// All RGB values should be greater than 200 for light text
				expect(r).toBeGreaterThan(200);
				expect(g).toBeGreaterThan(200);
				expect(b).toBeGreaterThan(200);
			}
		}
	});

	test('should maintain dark theme in presentation view', async ({ page }) => {
		// Navigate to demo presentation
		await page.goto('/demo');
		
		// Check background is dark
		const body = page.locator('body');
		const bgColor = await body.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});
		
		const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
		if (match) {
			const [, r, g, b] = match.map(Number);
			expect(r).toBeLessThan(50);
			expect(g).toBeLessThan(50);
			expect(b).toBeLessThan(50);
		}
	});
});
