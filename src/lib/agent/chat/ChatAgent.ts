/**
 * Interactive chat agent for presentation refinement
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ConversationHistory } from './ConversationHistory.js';
import { ComponentRegistry } from './ComponentRegistry.js';
import { buildPrompt, determineMode, formatConversationHistory } from './prompts/templates.js';
import type { Component } from './prompts/types.js';

export interface ChatResponse {
	text: string;
	components: Component[];
	conversationId: string;
}

export interface ChatChunk {
	type: 'text' | 'component' | 'done';
	content: string | Component;
}

export class ChatAgent {
	private model: ChatAnthropic;
	private history: ConversationHistory;
	private registry: ComponentRegistry;
	private conversationId: string;

	constructor(apiKey: string, modelId: string = 'claude-3-5-haiku-20241022') {
		this.model = new ChatAnthropic({
			apiKey,
			model: modelId,
			temperature: 0.7,
			maxTokens: 2048
		});

		this.history = new ConversationHistory(2000);
		this.registry = new ComponentRegistry();
		this.conversationId = this.generateConversationId();
	}

	/**
	 * Send a message and get a response
	 */
	async chat(message: string): Promise<ChatResponse> {
		// Add user message to history
		this.history.addMessage('user', message);

		// Determine interaction mode
		const mode = determineMode(
			message,
			this.registry.size() > 0,
			this.history.length()
		);

		// Build prompt with context
		const prompt = buildPrompt(mode, {
			conversationHistory: this.history.getAllMessages(),
			componentRegistry: this.registry.getMap()
		});

		// Format conversation history for API
		const conversationMessages = this.history.formatForAPI();

		// Build messages for LLM
		const messages = [
			new SystemMessage(prompt.system),
			...conversationMessages.map((m) => {
				if (m.role === 'user') return new HumanMessage(m.content);
				if (m.role === 'assistant') return new AIMessage(m.content);
				return new SystemMessage(m.content);
			}),
			new HumanMessage(message)
		];

		// Get response from LLM
		const response = await this.model.invoke(messages);
		const responseText = response.content.toString();

		// Extract components from response
		const components = this.extractComponents(responseText);

		// Register components
		const registeredComponents = components.map((comp) => {
			const id = this.registry.register(comp);
			return { ...comp, id };
		});

		// Add assistant message to history
		this.history.addMessage('assistant', responseText, registeredComponents);

		return {
			text: responseText,
			components: registeredComponents,
			conversationId: this.conversationId
		};
	}

	/**
	 * Stream a chat response
	 */
	async *streamChat(message: string): AsyncGenerator<ChatChunk> {
		// Add user message to history
		this.history.addMessage('user', message);

		// Determine interaction mode
		const mode = determineMode(
			message,
			this.registry.size() > 0,
			this.history.length()
		);

		// Build prompt with context
		const prompt = buildPrompt(mode, {
			conversationHistory: this.history.getAllMessages(),
			componentRegistry: this.registry.getMap()
		});

		// Format conversation history for API
		const conversationMessages = this.history.formatForAPI();

		// Build messages for LLM
		const messages = [
			new SystemMessage(prompt.system),
			...conversationMessages.map((m) => {
				if (m.role === 'user') return new HumanMessage(m.content);
				if (m.role === 'assistant') return new AIMessage(m.content);
				return new SystemMessage(m.content);
			}),
			new HumanMessage(message)
		];

		// Stream response from LLM
		let fullResponse = '';
		const stream = await this.model.stream(messages);

		for await (const chunk of stream) {
			const text = chunk.content.toString();
			fullResponse += text;
			yield { type: 'text', content: text };
		}

		// Extract components from full response
		const components = this.extractComponents(fullResponse);

		// Register components
		const registeredComponents: Component[] = [];
		for (const comp of components) {
			const id = this.registry.register(comp);
			const registeredComp = { ...comp, id };
			registeredComponents.push(registeredComp);
			yield { type: 'component', content: registeredComp };
		}

		// Add assistant message to history
		this.history.addMessage('assistant', fullResponse, registeredComponents);

		yield { type: 'done', content: '' };
	}

	/**
	 * Extract JSON components from response text
	 */
	private extractComponents(text: string): Component[] {
		const components: Component[] = [];
		const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/g;
		let match;

		while ((match = jsonBlockRegex.exec(text)) !== null) {
			try {
				const parsed = JSON.parse(match[1]);
				if (this.isValidComponent(parsed)) {
					components.push(parsed);
				}
			} catch (e) {
				// Invalid JSON, skip
				console.warn('Failed to parse component JSON:', e);
			}
		}

		return components;
	}

	/**
	 * Validate component structure
	 */
	private isValidComponent(obj: any): obj is Omit<Component, 'id'> {
		return (
			obj &&
			typeof obj === 'object' &&
			typeof obj.type === 'string' &&
			obj.content &&
			typeof obj.content === 'object'
		);
	}

	/**
	 * Reset conversation
	 */
	reset(): void {
		this.history.clear();
		this.registry.clear();
		this.conversationId = this.generateConversationId();
	}

	/**
	 * Get conversation history
	 */
	getHistory(): ConversationHistory {
		return this.history;
	}

	/**
	 * Get component registry
	 */
	getRegistry(): ComponentRegistry {
		return this.registry;
	}

	/**
	 * Generate unique conversation ID
	 */
	private generateConversationId(): string {
		return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}
}
