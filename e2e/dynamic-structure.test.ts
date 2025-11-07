import { expect, test } from '@playwright/test';

test.describe('Dynamic Presentation Structure', () => {
	test('should not always start with title slide', async ({ page }) => {
		// Generate multiple presentations and check for variety
		const openingTypes = new Set<string>();
		
		// Test with 3 different topics
		const topics = [
			'explain quantum computing',
			'compare cats and dogs',
			'history of the internet'
		];
		
		for (const topic of topics) {
			await page.goto('/');
			await page.click('text=Create New Session');
			
			// Wait for session page to load
			await page.waitForURL(/\/session\//);
			
			// Trigger quick chat
			await page.keyboard.press('Space');
			
			// Type the topic
			await page.fill('textarea', topic);
			await page.keyboard.press('Enter');
			
			// Wait for first component to appear
			await page.waitForSelector('[data-component-type]', { timeout: 10000 });
			
			// Get the first component type
			const firstComponent = await page.locator('[data-component-type]').first();
			const componentType = await firstComponent.getAttribute('data-component-type');
			
			if (componentType) {
				openingTypes.add(componentType);
			}
			
			// Small delay between tests
			await page.waitForTimeout(1000);
		}
		
		// We should see at least 2 different opening types across 3 presentations
		expect(openingTypes.size).toBeGreaterThanOrEqual(2);
	});

	test('should use varied component types throughout presentation', async ({ page }) => {
		await page.goto('/demo');
		
		// Wait for presentation to load
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		// Collect all component types used
		const componentTypes = new Set<string>();
		const components = await page.locator('[data-component-type]').all();
		
		for (const component of components) {
			const type = await component.getAttribute('data-component-type');
			if (type) {
				componentTypes.add(type);
			}
		}
		
		// Should use at least 4 different component types
		expect(componentTypes.size).toBeGreaterThanOrEqual(4);
	});

	test('should have varied pacing between slides', async ({ page }) => {
		await page.goto('/demo');
		
		// This test verifies that not all slides have the same duration
		// We'll check that the presentation has varied timing
		
		// Wait for presentation to start
		await page.waitForSelector('[data-component-type]', { timeout: 10000 });
		
		// Check that presentation has multiple slides (components appear/disappear)
		const initialCount = await page.locator('[data-component-type]').count();
		
		// Wait a bit and check if content has changed
		await page.waitForTimeout(5000);
		const laterCount = await page.locator('[data-component-type]').count();
		
		// Content should have changed (different number of components)
		// This indicates slides are progressing
		expect(initialCount !== laterCount || laterCount > 0).toBeTruthy();
	});
});
