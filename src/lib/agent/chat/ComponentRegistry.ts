/**
 * Registry for tracking and managing presentation components
 */

import type { Component } from './prompts/types.js';

export class ComponentRegistry {
	private components: Map<string, Component>;
	private idCounter: number;

	constructor() {
		this.components = new Map();
		this.idCounter = 0;
	}

	/**
	 * Register a new component and return its unique ID
	 * If component already has an ID, use it; otherwise generate one
	 */
	register(component: Component | Omit<Component, 'id'>): string {
		const id = 'id' in component && component.id ? component.id : this.generateId();
		const fullComponent: Component = {
			...component,
			id,
			timestamp: Date.now()
		};
		this.components.set(id, fullComponent);
		return id;
	}

	/**
	 * Get a component by ID
	 */
	get(id: string): Component | null {
		return this.components.get(id) || null;
	}

	/**
	 * Update an existing component
	 */
	update(id: string, updates: Partial<Omit<Component, 'id'>>): boolean {
		const existing = this.components.get(id);
		if (!existing) {
			return false;
		}

		const updated: Component = {
			...existing,
			...updates,
			id, // Preserve ID
			timestamp: Date.now()
		};

		this.components.set(id, updated);
		return true;
	}

	/**
	 * List all components
	 */
	list(): Component[] {
		return Array.from(this.components.values()).sort((a, b) => {
			const timeA = a.timestamp || 0;
			const timeB = b.timestamp || 0;
			return timeA - timeB;
		});
	}

	/**
	 * Get the internal map (for context building)
	 */
	getMap(): Map<string, Component> {
		return new Map(this.components);
	}

	/**
	 * Clear all components
	 */
	clear(): void {
		this.components.clear();
		this.idCounter = 0;
	}

	/**
	 * Get component count
	 */
	size(): number {
		return this.components.size;
	}

	/**
	 * Generate a unique component ID
	 */
	private generateId(): string {
		this.idCounter++;
		return `comp_${this.idCounter}_${Date.now()}`;
	}
}
