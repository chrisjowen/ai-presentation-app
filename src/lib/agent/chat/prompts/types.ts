/**
 * Type definitions for the modular prompt system
 */

export interface PromptTemplate {
	system: string;
	examples?: string;
	tools?: string;
	context?: string;
}

export interface ConversationMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	components?: Component[];
}

export interface Component {
	id: string;
	type: 'hero' | 'heading' | 'text' | 'chart' | 'image' | 'quote' | 'list' | 'code';
	content: any;
	timestamp?: number;
}

export interface ChatContext {
	conversationHistory: ConversationMessage[];
	componentRegistry: Map<string, Component>;
	maxTokens?: number;
}

export interface PromptMode {
	mode: 'initial' | 'refinement' | 'component-update' | 'question';
	includeExamples: boolean;
	includeTools: boolean;
	includeComponents: boolean;
}
