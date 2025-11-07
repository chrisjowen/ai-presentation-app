import { describe, it, expect } from 'vitest';
import { EXAMPLES } from '../examples';

describe('Component Examples', () => {
	describe('EXAMPLES', () => {
		it('should be a non-empty string', () => {
			expect(EXAMPLES).toBeDefined();
			expect(typeof EXAMPLES).toBe('string');
			expect(EXAMPLES.length).toBeGreaterThan(0);
		});

		it('should contain example interactions', () => {
			expect(EXAMPLES).toContain('Example 1');
			expect(EXAMPLES).toContain('Example 2');
			expect(EXAMPLES).toContain('Example 3');
			expect(EXAMPLES).toContain('Example 4');
		});

		it('should contain component type examples', () => {
			const componentTypes = ['hero', 'heading', 'text', 'chart', 'quote'];
			
			componentTypes.forEach(type => {
				expect(EXAMPLES).toContain(`"type": "${type}"`);
			});
		});

		it('should contain JSON code blocks', () => {
			expect(EXAMPLES).toContain('```json');
		});

		it('should demonstrate different interaction patterns', () => {
			expect(EXAMPLES).toContain('Initial Request');
			expect(EXAMPLES).toContain('Component Update');
			expect(EXAMPLES).toContain('Adding Content');
			expect(EXAMPLES).toContain('Question');
		});
	});
});
