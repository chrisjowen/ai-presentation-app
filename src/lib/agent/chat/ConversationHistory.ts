/**
 * Manages conversation history with token-aware context window
 */

import type { ConversationMessage, Component } from './prompts/types.js';

export class ConversationHistory {
	private messages: ConversationMessage[];
	private readonly maxTokens: number;

	constructor(maxTokens: number = 2000) {
		this.messages = [];
		this.maxTokens = maxTokens;
	}

	/**
	 * Add a message to the conversation history
	 */
	addMessage(
		role: 'user' | 'assistant' | 'system',
		content: string,
		components?: Component[]
	): void {
		const message: ConversationMessage = {
			role,
			content,
			timestamp: Date.now(),
			components
		};
		this.messages.push(message);
	}

	/**
	 * Get conversation context within token limit
	 * Returns most recent messages that fit within maxTokens
	 */
	getContext(maxTokens?: number): ConversationMessage[] {
		const limit = maxTokens || this.maxTokens;
		const context: ConversationMessage[] = [];
		let totalTokens = 0;

		// Iterate from most recent to oldest
		for (let i = this.messages.length - 1; i >= 0; i--) {
			const message = this.messages[i];
			const tokens = this.estimateTokens(message.content);

			if (totalTokens + tokens > limit) {
				break;
			}

			context.unshift(message);
			totalTokens += tokens;
		}

		return context;
	}

	/**
	 * Get all messages (for full history)
	 */
	getAllMessages(): ConversationMessage[] {
		return [...this.messages];
	}

	/**
	 * Get a component by ID from message history
	 */
	getComponentById(id: string): Component | null {
		for (const message of this.messages) {
			if (message.components) {
				const component = message.components.find((c) => c.id === id);
				if (component) {
					return component;
				}
			}
		}
		return null;
	}

	/**
	 * Get all components from conversation history
	 */
	getAllComponents(): Component[] {
		const components: Component[] = [];
		for (const message of this.messages) {
			if (message.components) {
				components.push(...message.components);
			}
		}
		return components;
	}

	/**
	 * Clear conversation history
	 */
	clear(): void {
		this.messages = [];
	}

	/**
	 * Get conversation length (number of messages)
	 */
	length(): number {
		return this.messages.length;
	}

	/**
	 * Summarize old messages to save tokens
	 * Returns a summary of messages outside the context window
	 */
	summarize(contextMessages: ConversationMessage[]): string {
		const contextIds = new Set(contextMessages.map((m) => m.timestamp));
		const oldMessages = this.messages.filter((m) => !contextIds.has(m.timestamp));

		if (oldMessages.length === 0) {
			return '';
		}

		const userMessages = oldMessages.filter((m) => m.role === 'user').length;
		const assistantMessages = oldMessages.filter((m) => m.role === 'assistant').length;
		const componentCount = oldMessages.reduce(
			(count, m) => count + (m.components?.length || 0),
			0
		);

		return `[Earlier conversation: ${userMessages} user messages, ${assistantMessages} assistant responses, ${componentCount} components created]`;
	}

	/**
	 * Estimate token count for text
	 * Rough approximation: 1 token ≈ 4 characters
	 */
	private estimateTokens(text: string): number {
		return Math.ceil(text.length / 4);
	}

	/**
	 * Format messages for LLM API
	 */
	formatForAPI(maxTokens?: number): Array<{ role: string; content: string }> {
		const context = this.getContext(maxTokens);
		const summary = this.summarize(context);

		const formatted = context.map((m) => ({
			role: m.role,
			content: m.content
		}));

		// Add summary as system message if there are old messages
		if (summary) {
			formatted.unshift({
				role: 'system',
				content: summary
			});
		}

		return formatted;
	}
}
