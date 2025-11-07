/**
 * Prompt template builders for different interaction modes
 */

import { SYSTEM_PROMPT } from './system.js';
import { EXAMPLES } from './examples.js';
import { TOOLS_DESCRIPTION } from './tools.js';
import type { PromptTemplate, PromptMode, ChatContext, Component } from './types.js';

/**
 * Build a complete prompt based on mode and context
 */
export function buildPrompt(mode: PromptMode, context?: ChatContext): PromptTemplate {
	let prompt = SYSTEM_PROMPT;

	// Add examples for initial requests
	if (mode.includeExamples) {
		prompt += '\n\n' + EXAMPLES;
	}

	// Add tool descriptions
	if (mode.includeTools) {
		prompt += '\n\n' + TOOLS_DESCRIPTION;
	}

	// Add component context
	if (mode.includeComponents && context?.componentRegistry.size) {
		prompt += '\n\n' + buildComponentContext(context.componentRegistry);
	}

	return {
		system: prompt
	};
}

/**
 * Build context about existing components
 */
function buildComponentContext(registry: Map<string, Component>): string {
	if (registry.size === 0) return '';

	const components = Array.from(registry.values());
	const componentList = components
		.map((c, idx) => {
			const summary = summarizeComponent(c);
			return `${idx + 1}. [${c.id}] ${c.type}: ${summary}`;
		})
		.join('\n');

	return `## Current Presentation Components

You can reference these components by their ID when the user asks to update them:

${componentList}

When updating a component, return the same component type with the updated content.`;
}

/**
 * Summarize a component for context
 */
function summarizeComponent(component: Component): string {
	switch (component.type) {
		case 'hero':
			return component.content.title;
		case 'heading':
			return component.content.text;
		case 'text':
			return component.content.text.substring(0, 50) + '...';
		case 'chart':
			return `${component.content.title} (${component.content.chartType})`;
		case 'image':
			return component.content.alt || component.content.caption || 'Image';
		case 'quote':
			return `"${component.content.text.substring(0, 50)}..." - ${component.content.author}`;
		case 'list':
			return `${component.content.items.length} items`;
		case 'code':
			return `${component.content.language} code`;
		default:
			return 'Unknown component';
	}
}

/**
 * Determine the appropriate mode based on user message and context
 */
export function determineMode(
	message: string,
	hasComponents: boolean,
	conversationLength: number
): PromptMode {
	const lowerMessage = message.toLowerCase();

	// Check for update/refinement keywords
	const updateKeywords = [
		'update',
		'change',
		'modify',
		'edit',
		'fix',
		'adjust',
		'revise',
		'that',
		'the chart',
		'the image',
		'the text'
	];
	const isUpdate = updateKeywords.some((keyword) => lowerMessage.includes(keyword));

	// Check for question keywords
	const questionKeywords = ['what', 'why', 'how', 'when', 'where', 'who', 'explain', 'tell me'];
	const isQuestion =
		questionKeywords.some((keyword) => lowerMessage.startsWith(keyword)) ||
		lowerMessage.includes('?');

	// Determine mode
	if (isUpdate && hasComponents) {
		return {
			mode: 'component-update',
			includeExamples: false,
			includeTools: false,
			includeComponents: true
		};
	}

	if (isQuestion) {
		return {
			mode: 'question',
			includeExamples: false,
			includeTools: true,
			includeComponents: false
		};
	}

	if (conversationLength === 0) {
		return {
			mode: 'initial',
			includeExamples: true,
			includeTools: true,
			includeComponents: false
		};
	}

	return {
		mode: 'refinement',
		includeExamples: false,
		includeTools: true,
		includeComponents: hasComponents
	};
}

/**
 * Format conversation history for context
 */
export function formatConversationHistory(
	messages: Array<{ role: string; content: string }>,
	maxTokens: number = 2000
): Array<{ role: string; content: string }> {
	// Rough token estimation: 1 token ≈ 4 characters
	const estimateTokens = (text: string) => Math.ceil(text.length / 4);

	const formatted: Array<{ role: string; content: string }> = [];
	let totalTokens = 0;

	// Add messages in reverse order (most recent first)
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		const tokens = estimateTokens(message.content);

		if (totalTokens + tokens > maxTokens) {
			break;
		}

		formatted.unshift(message);
		totalTokens += tokens;
	}

	return formatted;
}
