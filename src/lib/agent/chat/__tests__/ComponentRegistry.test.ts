import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from '../ComponentRegistry';
import type { Component } from '../prompts/types';

describe('ComponentRegistry', () => {
	let registry: ComponentRegistry;

	beforeEach(() => {
		registry = new ComponentRegistry();
	});

	describe('register', () => {
		it('should register a component and return its ID', () => {
			const component: Component = {
				id: 'comp-1',
				type: 'text',
				content: { text: 'Hello' }
			};

			const id = registry.register(component);
			expect(id).toBe('comp-1');
		});

		it('should generate ID if not provided', () => {
			const component = {
				type: 'text' as const,
				content: { text: 'Hello' }
			};

			const id = registry.register(component as Component);
			expect(id).toBeDefined();
			expect(typeof id).toBe('string');
			expect(id.length).toBeGreaterThan(0);
		});

		it('should store component for later retrieval', () => {
			const component: Component = {
				id: 'comp-1',
				type: 'text',
				content: { text: 'Hello' }
			};

			registry.register(component);
			const retrieved = registry.get('comp-1');
			expect(retrieved?.id).toBe(component.id);
			expect(retrieved?.type).toBe(component.type);
			expect(retrieved?.content).toEqual(component.content);
		});

		it('should handle multiple components', () => {
			const comp1: Component = { id: 'comp-1', type: 'text', content: { text: 'First' } };
			const comp2: Component = { id: 'comp-2', type: 'heading', content: { text: 'Second', level: 1 } };

			registry.register(comp1);
			registry.register(comp2);

			const retrieved1 = registry.get('comp-1');
			const retrieved2 = registry.get('comp-2');
			
			expect(retrieved1?.id).toBe('comp-1');
			expect(retrieved1?.content).toEqual(comp1.content);
			expect(retrieved2?.id).toBe('comp-2');
			expect(retrieved2?.content).toEqual(comp2.content);
		});
	});

	describe('get', () => {
		it('should return component by ID', () => {
			const component: Component = {
				id: 'comp-1',
				type: 'text',
				content: { text: 'Hello' }
			};

			registry.register(component);
			const retrieved = registry.get('comp-1');
			expect(retrieved?.id).toBe(component.id);
			expect(retrieved?.type).toBe(component.type);
			expect(retrieved?.content).toEqual(component.content);
		});

		it('should return null for non-existent ID', () => {
			const retrieved = registry.get('non-existent');
			expect(retrieved).toBeNull();
		});

		it('should return null for empty registry', () => {
			const retrieved = registry.get('any-id');
			expect(retrieved).toBeNull();
		});
	});

	describe('update', () => {
		it('should update existing component', () => {
			const component: Component = {
				id: 'comp-1',
				type: 'text',
				content: { text: 'Original' }
			};

			registry.register(component);
			const success = registry.update('comp-1', { content: { text: 'Updated' } });

			expect(success).toBe(true);
			const updated = registry.get('comp-1');
			expect(updated?.content.text).toBe('Updated');
		});

		it('should return false for non-existent component', () => {
			const success = registry.update('non-existent', { content: { text: 'Updated' } });
			expect(success).toBe(false);
		});

		it('should preserve unchanged fields', () => {
			const component: Component = {
				id: 'comp-1',
				type: 'text',
				content: { text: 'Original' }
			};

			registry.register(component);
			registry.update('comp-1', { content: { text: 'Updated' } });

			const updated = registry.get('comp-1');
			expect(updated?.id).toBe('comp-1');
			expect(updated?.type).toBe('text');
		});
	});

	describe('list', () => {
		it('should return all registered components', () => {
			const comp1: Component = { id: 'comp-1', type: 'text', content: { text: 'First' } };
			const comp2: Component = { id: 'comp-2', type: 'heading', content: { text: 'Second', level: 1 } };

			registry.register(comp1);
			registry.register(comp2);

			const list = registry.list();
			expect(list).toHaveLength(2);
			expect(list.find(c => c.id === 'comp-1')?.content).toEqual(comp1.content);
			expect(list.find(c => c.id === 'comp-2')?.content).toEqual(comp2.content);
		});

		it('should return empty array for empty registry', () => {
			const list = registry.list();
			expect(list).toEqual([]);
		});

		it('should return copy of components array', () => {
			const component: Component = { id: 'comp-1', type: 'text', content: { text: 'Hello' } };
			registry.register(component);

			const list1 = registry.list();
			const list2 = registry.list();

			expect(list1).not.toBe(list2); // Different array instances
			expect(list1).toEqual(list2); // Same content
		});
	});

	describe('clear', () => {
		it('should remove all components', () => {
			const comp1: Component = { id: 'comp-1', type: 'text', content: { text: 'First' } };
			const comp2: Component = { id: 'comp-2', type: 'heading', content: { text: 'Second', level: 1 } };

			registry.register(comp1);
			registry.register(comp2);

			registry.clear();

			expect(registry.list()).toHaveLength(0);
			expect(registry.get('comp-1')).toBeNull();
			expect(registry.get('comp-2')).toBeNull();
		});

		it('should allow registering after clear', () => {
			const comp1: Component = { id: 'comp-1', type: 'text', content: { text: 'First' } };
			registry.register(comp1);

			registry.clear();

			const comp2: Component = { id: 'comp-2', type: 'text', content: { text: 'Second' } };
			registry.register(comp2);

			expect(registry.list()).toHaveLength(1);
			const retrieved = registry.get('comp-2');
			expect(retrieved?.id).toBe('comp-2');
			expect(retrieved?.content).toEqual(comp2.content);
		});
	});

	describe('size', () => {
		it('should return number of registered components', () => {
			expect(registry.size()).toBe(0);

			registry.register({ id: 'comp-1', type: 'text', content: { text: 'First' } });
			expect(registry.size()).toBe(1);

			registry.register({ id: 'comp-2', type: 'text', content: { text: 'Second' } });
			expect(registry.size()).toBe(2);
		});

		it('should update after clear', () => {
			registry.register({ id: 'comp-1', type: 'text', content: { text: 'First' } });
			registry.register({ id: 'comp-2', type: 'text', content: { text: 'Second' } });

			expect(registry.size()).toBe(2);

			registry.clear();
			expect(registry.size()).toBe(0);
		});
	});
});
