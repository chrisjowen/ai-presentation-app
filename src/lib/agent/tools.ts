/**
 * Agent Tools for UI Control
 * These tools allow the agent to manipulate the presentation
 */

import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import type { Component, TransitionType } from '$lib/types/components';
import type { TimelineEvent } from '$lib/types/timeline';

// Simplified schemas - avoid complex Zod features that cause issues
const TransitionSchema = z.enum(['fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'instant']);

// Add Component Tool - simplified to use z.any() for component
export const addComponentTool = tool(
	({ component, transition, timestamp }) => {
		const event: TimelineEvent = {
			type: 'add',
			component: component as Component,
			transition: transition as TransitionType,
			timestamp
		};
		return JSON.stringify(event);
	},
	{
		name: 'add_component',
		description: `Add a new component (text or image) to the presentation screen.

Component types:
- Text: { id: string, type: "text", content: string, variant?: "heading"|"subheading"|"body"|"caption", align?: "left"|"center"|"right", color?: string }
- Image: { id: string, type: "image", src: string, alt?: string, fit?: "contain"|"cover"|"fill" }`,
		schema: z.object({
			component: z.any().describe('The component object to add (text or image)'),
			transition: TransitionSchema.optional().describe('Transition animation (default: instant)'),
			timestamp: z.number().optional().describe('Delay in milliseconds from previous event (default: 0)')
		})
	}
);

// Update Component Tool
export const updateComponentTool = tool(
	({ componentId, updates, transition, timestamp }) => {
		const event: TimelineEvent = {
			type: 'update',
			componentId,
			updates: updates as Partial<Component>,
			transition: transition as TransitionType,
			timestamp
		};
		return JSON.stringify(event);
	},
	{
		name: 'update_component',
		description: 'Update an existing component by its ID with new properties',
		schema: z.object({
			componentId: z.string().describe('ID of the component to update'),
			updates: z.any().describe('Object with properties to update'),
			transition: TransitionSchema.optional(),
			timestamp: z.number().optional()
		})
	}
);

// Remove Component Tool
export const removeComponentTool = tool(
	({ componentId, transition, timestamp }) => {
		const event: TimelineEvent = {
			type: 'remove',
			componentId,
			transition: transition as TransitionType,
			timestamp
		};
		return JSON.stringify(event);
	},
	{
		name: 'remove_component',
		description: 'Remove a component from the screen by its ID',
		schema: z.object({
			componentId: z.string().describe('ID of the component to remove'),
			transition: TransitionSchema.optional(),
			timestamp: z.number().optional()
		})
	}
);

// Clear Screen Tool
export const clearScreenTool = tool(
	({ transition, timestamp }) => {
		const event: TimelineEvent = {
			type: 'clear',
			transition: transition as TransitionType,
			timestamp
		};
		return JSON.stringify(event);
	},
	{
		name: 'clear_screen',
		description: 'Clear all components from the screen',
		schema: z.object({
			transition: TransitionSchema.optional(),
			timestamp: z.number().optional()
		})
	}
);

// Speak Tool
export const speakTool = tool(
	({ text, rate, pitch, timestamp }) => {
		const event: TimelineEvent = {
			type: 'speak',
			text,
			rate,
			pitch,
			timestamp
		};
		return JSON.stringify(event);
	},
	{
		name: 'speak',
		description: 'Use text-to-speech to narrate text. This will be spoken aloud to the user.',
		schema: z.object({
			text: z.string().describe('Text to speak'),
			rate: z.number().optional().describe('Speech rate (default: 1)'),
			pitch: z.number().optional().describe('Speech pitch (default: 1)'),
			timestamp: z.number().optional().describe('Delay before speaking')
		})
	}
);

// Get Current State Tool
export const getCurrentStateTool = tool(
	({ dummy }) => {
		// This will be populated with actual state in the agent
		return 'Current state will be injected by agent';
	},
	{
		name: 'get_current_state',
		description: 'Get the current state of the presentation including all visible components',
		schema: z.object({
			dummy: z.string().optional().describe('Not used, just for schema')
		})
	}
);

// Search Images Tool
export const searchImagesTool = tool(
	async ({ query }) => {
		try {
			// Use Unsplash API (free, no auth needed for basic usage)
			const response = await fetch(
				`https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(query)}`
			);

			// Unsplash redirects to the actual image
			const imageUrl = response.url;

			return JSON.stringify({
				success: true,
				imageUrl,
				query
			});
		} catch (error) {
			// Fallback to placeholder if search fails
			const fallbackUrl = `https://via.placeholder.com/1200x800/4338ca/ffffff?text=${encodeURIComponent(query)}`;
			return JSON.stringify({
				success: false,
				imageUrl: fallbackUrl,
				query,
				error: 'Search failed, using placeholder'
			});
		}
	},
	{
		name: 'search_images',
		description: 'Search for images by query and get an image URL. Use this to find relevant images for your presentation!',
		schema: z.object({
			query: z.string().describe('Search query for the image (e.g., "golden retriever", "sunset mountain", "data visualization")')
		})
	}
);

export const allTools = [
	addComponentTool,
	updateComponentTool,
	removeComponentTool,
	clearScreenTool,
	speakTool,
	searchImagesTool,
	getCurrentStateTool
];
