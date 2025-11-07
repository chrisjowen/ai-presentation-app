/**
 * AI Model Configuration
 */

export interface ModelConfig {
	id: string;
	name: string;
	provider: 'anthropic' | 'openai';
	modelId: string;
	maxTokens: number;
	temperature: number;
	description: string;
	icon: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
	{
		id: 'claude-sonnet',
		name: 'Claude 3.5 Sonnet',
		provider: 'anthropic',
		modelId: 'claude-sonnet-4-5-20250929',
		maxTokens: 4096,
		temperature: 0.7,
		description: 'Most intelligent model, best for complex tasks',
		icon: '🧠'
	},
	{
		id: 'gpt-4o',
		name: 'GPT-4o',
		provider: 'openai',
		modelId: 'gpt-4o',
		maxTokens: 4096,
		temperature: 0.7,
		description: 'OpenAI\'s most advanced multimodal model',
		icon: '🤖'
	},
	{
		id: 'gpt-4o-mini',
		name: 'GPT-4o Mini',
		provider: 'openai',
		modelId: 'gpt-4o-mini',
		maxTokens: 4096,
		temperature: 0.7,
		description: 'Fast and cost-effective',
		icon: '⚡'
	},
	{
		id: 'gpt-4-turbo',
		name: 'GPT-4 Turbo',
		provider: 'openai',
		modelId: 'gpt-4-turbo-preview',
		maxTokens: 4096,
		temperature: 0.7,
		description: 'Powerful GPT-4 with extended context',
		icon: '🚀'
	}
];

export const DEFAULT_MODEL_ID = 'claude-sonnet';

export function getModelById(id: string): ModelConfig | undefined {
	return AVAILABLE_MODELS.find(m => m.id === id);
}
