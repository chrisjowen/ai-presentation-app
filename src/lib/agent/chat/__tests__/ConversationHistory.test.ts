import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationHistory } from '../ConversationHistory';

describe('ConversationHistory', () => {
	let history: ConversationHistory;

	beforeEach(() => {
		history = new ConversationHistory();
	});

	describe('addMessage', () => {
		it('should add a message to history', () => {
			history.addMessage('user', 'Hello');
			
			const messages = history.getAllMessages();
			expect(messages).toHaveLength(1);
			expect(messages[0].role).toBe('user');
			expect(messages[0].content).toBe('Hello');
		});

		it('should add timestamp to message', () => {
			const before = Date.now();
			history.addMessage('user', 'Hello');
			const after = Date.now();
			
			const messages = history.getAllMessages();
			expect(messages[0].timestamp).toBeGreaterThanOrEqual(before);
			expect(messages[0].timestamp).toBeLessThanOrEqual(after);
		});

		it('should store components with message', () => {
			const components = [
				{ id: 'comp-1', type: 'text' as const, content: { text: 'Hello' } }
			];
			
			history.addMessage('assistant', 'Response', components);
			
			const messages = history.getAllMessages();
			expect(messages[0].components).toEqual(components);
		});

		it('should handle multiple messages', () => {
			history.addMessage('user', 'Message 1');
			history.addMessage('assistant', 'Response 1');
			history.addMessage('user', 'Message 2');
			
			const messages = history.getAllMessages();
			expect(messages).toHaveLength(3);
		});
	});

	describe('getContext', () => {
		beforeEach(() => {
			history.addMessage('user', 'First message');
			history.addMessage('assistant', 'First response');
			history.addMessage('user', 'Second message');
			history.addMessage('assistant', 'Second response');
			history.addMessage('user', 'Third message');
		});

		it('should return all messages when under token limit', () => {
			const context = history.getContext(10000);
			expect(context).toHaveLength(5);
		});

		it('should limit messages by token count', () => {
			// Very small token limit should return fewer messages
			const context = history.getContext(10);
			expect(context.length).toBeLessThan(5);
		});

		it('should return most recent messages first', () => {
			const context = history.getContext(100);
			
			// Should include most recent messages
			expect(context[context.length - 1].content).toBe('Third message');
		});

		it('should return empty array for empty history', () => {
			const emptyHistory = new ConversationHistory();
			const context = emptyHistory.getContext(1000);
			expect(context).toEqual([]);
		});
	});

	describe('getComponentById', () => {
		it('should find component by ID', () => {
			const component = { id: 'comp-1', type: 'text' as const, content: { text: 'Hello' } };
			history.addMessage('assistant', 'Response', [component]);
			
			const found = history.getComponentById('comp-1');
			expect(found).toEqual(component);
		});

		it('should return null for non-existent ID', () => {
			const found = history.getComponentById('non-existent');
			expect(found).toBeNull();
		});

		it('should find component across multiple messages', () => {
			const comp1 = { id: 'comp-1', type: 'text' as const, content: { text: 'First' } };
			const comp2 = { id: 'comp-2', type: 'text' as const, content: { text: 'Second' } };
			
			history.addMessage('assistant', 'Response 1', [comp1]);
			history.addMessage('assistant', 'Response 2', [comp2]);
			
			expect(history.getComponentById('comp-1')).toEqual(comp1);
			expect(history.getComponentById('comp-2')).toEqual(comp2);
		});
	});

	describe('clear', () => {
		it('should remove all messages', () => {
			history.addMessage('user', 'Message 1');
			history.addMessage('assistant', 'Response 1');
			
			history.clear();
			
			const messages = history.getAllMessages();
			expect(messages).toHaveLength(0);
		});

		it('should allow adding messages after clear', () => {
			history.addMessage('user', 'Message 1');
			history.clear();
			history.addMessage('user', 'Message 2');
			
			const messages = history.getAllMessages();
			expect(messages).toHaveLength(1);
			expect(messages[0].content).toBe('Message 2');
		});
	});

	describe('getAllMessages', () => {
		it('should return all messages in order', () => {
			history.addMessage('user', 'First');
			history.addMessage('assistant', 'Second');
			history.addMessage('user', 'Third');
			
			const messages = history.getAllMessages();
			expect(messages).toHaveLength(3);
			expect(messages[0].content).toBe('First');
			expect(messages[1].content).toBe('Second');
			expect(messages[2].content).toBe('Third');
		});

		it('should return empty array for new history', () => {
			const messages = history.getAllMessages();
			expect(messages).toEqual([]);
		});
	});

	describe('length', () => {
		it('should return number of messages', () => {
			expect(history.length()).toBe(0);
			
			history.addMessage('user', 'Message 1');
			expect(history.length()).toBe(1);
			
			history.addMessage('assistant', 'Response 1');
			expect(history.length()).toBe(2);
		});
	});
});
