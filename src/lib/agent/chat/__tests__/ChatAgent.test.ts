import { describe, it, expect, beforeEach } from 'vitest';
import { ChatAgent } from '../ChatAgent';

describe('ChatAgent', () => {
	let agent: ChatAgent;

	beforeEach(() => {
		// Create agent with mock API key for testing
		agent = new ChatAgent('test-key', 'claude-3-haiku-20240307');
	});

	describe('constructor', () => {
		it('should create agent with default configuration', () => {
			expect(agent).toBeDefined();
		});

		it('should initialize with empty history', () => {
			expect(agent.getHistory().length()).toBe(0);
		});

		it('should initialize with empty registry', () => {
			expect(agent.getRegistry().size()).toBe(0);
		});
	});

	describe('getHistory', () => {
		it('should return conversation history instance', () => {
			const history = agent.getHistory();
			expect(history).toBeDefined();
			expect(typeof history.addMessage).toBe('function');
		});
	});

	describe('getRegistry', () => {
		it('should return component registry instance', () => {
			const registry = agent.getRegistry();
			expect(registry).toBeDefined();
			expect(typeof registry.register).toBe('function');
		});
	});

	describe('reset', () => {
		it('should clear history and registry', () => {
			// Add some data
			agent.getHistory().addMessage('user', 'Hello');
			agent.getRegistry().register({ id: 'comp-1', type: 'text', content: { text: 'Test' } });

			// Reset
			agent.reset();

			// Verify cleared
			expect(agent.getHistory().length()).toBe(0);
			expect(agent.getRegistry().size()).toBe(0);
		});
	});

	// Note: Actual chat() method tests would require mocking the LLM API
	// Those will be integration tests rather than unit tests
});
