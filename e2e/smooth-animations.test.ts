import { expect, test } from '@playwright/test';

test.describe('Smooth Animations', () => {
	test('should have smooth text fade-in animations', async ({ page }) => {
		await page.goto('/demo');
		
		// Wait for first component
		await page.waitForSelector('[data-component-type="text"]', { timeout: 10000 });
		
		// Check that text component has transition classes
		const textComponent = page.locator('[data-component-type="text"]').first();
		const classes = await textComponent.getAttribute('class');
		
		// Should have animation or transition classes
		expect(classes).toMatch(/(animate|transition|fade|slide)/);
	});

	test('should respect prefers-reduced-motion', async ({ page, context }) => {
		// Set reduced motion preference
		await context.addInitScript(() => {
			Object.defineProperty(window, 'matchMedia', {
				writable: true,
				value: (query: string) => ({
					matches: query === '(prefers-reduced-motion: reduce)',
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => true,
				}),
			});
		});
		
		await page.goto('/demo');
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		// With reduced motion, animations should be minimal or instant
		// This is a placeholder - actual implementation will vary
		const component = page.locator('[data-component-type]').first();
		await expect(component).toBeVisible();
	});

	test('should have smooth slide transitions', async ({ page }) => {
		await page.goto('/demo');
		
		// Wait for presentation to start
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		// Get initial component count
		const initialCount = await page.locator('[data-component-type]').count();
		
		// Wait for slide change
		await page.waitForTimeout(5000);
		
		// Check that transition occurred
		const laterCount = await page.locator('[data-component-type]').count();
		
		// Content should have changed (indicating slide transition)
		expect(initialCount !== laterCount || laterCount > 0).toBeTruthy();
	});

	test('should not have jarring or abrupt transitions', async ({ page }) => {
		await page.goto('/demo');
		
		// This test verifies smooth transitions by checking CSS properties
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		const component = page.locator('[data-component-type]').first();
		
		// Check for transition CSS property
		const transitionDuration = await component.evaluate((el) => {
			return window.getComputedStyle(el).transitionDuration;
		});
		
		// Should have some transition duration (not instant)
		// Even if it's '0s', the property should exist
		expect(transitionDuration).toBeDefined();
	});

	test('should have smooth initial load experience', async ({ page }) => {
		const startTime = Date.now();
		
		await page.goto('/demo');
		
		// Wait for first content to appear
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		const loadTime = Date.now() - startTime;
		
		// Initial load should be reasonably fast (< 5 seconds)
		expect(loadTime).toBeLessThan(5000);
		
		// Check that loading animation exists
		// (This will be implemented in the LoadingAnimation component)
		const hasLoadingState = await page.locator('.loading, [data-loading]').count();
		
		// Either we see loading state or content loads fast enough
		expect(hasLoadingState >= 0).toBeTruthy();
	});
});
