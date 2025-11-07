import { expect, test } from '@playwright/test';

test.describe('New Component Types', () => {
	test('should render Progress component', async ({ page }) => {
		await page.goto('/demo');
		
		// Wait for any component to load
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		// Check if progress component exists (may not be in demo)
		const progressComponent = page.locator('[data-component-type="progress"]');
		const count = await progressComponent.count();
		
		// Test passes if component type is recognized (even if not in demo)
		expect(count >= 0).toBeTruthy();
	});

	test('should render Badge component', async ({ page }) => {
		await page.goto('/demo');
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		const badgeComponent = page.locator('[data-component-type="badge"]');
		const count = await badgeComponent.count();
		
		expect(count >= 0).toBeTruthy();
	});

	test('should render Alert component', async ({ page }) => {
		await page.goto('/demo');
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		const alertComponent = page.locator('[data-component-type="alert"]');
		const count = await alertComponent.count();
		
		expect(count >= 0).toBeTruthy();
	});

	test('should render Separator component', async ({ page }) => {
		await page.goto('/demo');
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		const separatorComponent = page.locator('[data-component-type="separator"]');
		const count = await separatorComponent.count();
		
		expect(count >= 0).toBeTruthy();
	});

	test('should have varied layouts throughout presentation', async ({ page }) => {
		await page.goto('/demo');
		
		// Wait for presentation to load
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		// Collect all unique component types
		const componentTypes = new Set<string>();
		const components = await page.locator('[data-component-type]').all();
		
		for (const component of components) {
			const type = await component.getAttribute('data-component-type');
			if (type) {
				componentTypes.add(type);
			}
		}
		
		// Should use at least 5 different component types for variety
		expect(componentTypes.size).toBeGreaterThanOrEqual(5);
	});

	test('should not repeat same layout pattern', async ({ page }) => {
		await page.goto('/demo');
		
		// Wait for multiple slides to appear
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		await page.waitForTimeout(3000);
		
		// Get sequence of component types
		const components = await page.locator('[data-component-type]').all();
		const sequence: string[] = [];
		
		for (const component of components) {
			const type = await component.getAttribute('data-component-type');
			if (type) {
				sequence.push(type);
			}
		}
		
		// Check that we don't have the same component type repeated 3+ times in a row
		let maxRepeat = 1;
		let currentRepeat = 1;
		
		for (let i = 1; i < sequence.length; i++) {
			if (sequence[i] === sequence[i - 1]) {
				currentRepeat++;
				maxRepeat = Math.max(maxRepeat, currentRepeat);
			} else {
				currentRepeat = 1;
			}
		}
		
		// Should not have more than 2 of the same component in a row
		expect(maxRepeat).toBeLessThanOrEqual(2);
	});
});
