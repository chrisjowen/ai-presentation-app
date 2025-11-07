<script lang="ts">
	import { onMount } from 'svelte';
	import ComponentRenderer from './ComponentRenderer.svelte';
	import type { Component } from '$lib/agent/chat/prompts/types';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
		components?: Component[];
		timestamp: number;
	}

	interface Props {
		sessionId: string;
		onClose?: () => void;
	}

	let { sessionId, onClose }: Props = $props();

	let messages = $state<Message[]>([]);
	let inputText = $state('');
	let isLoading = $state(false);
	let inputElement = $state<HTMLTextAreaElement>();
	let messagesContainer = $state<HTMLDivElement>();

	onMount(() => {
		// Load conversation history
		loadHistory();
		// Focus input
		inputElement?.focus();
	});

	async function loadHistory() {
		try {
			const response = await fetch(`/api/chat?sessionId=${sessionId}`);
			if (response.ok) {
				const data = await response.json();
				messages = data.messages || [];
				scrollToBottom();
			}
		} catch (error) {
			console.error('Failed to load chat history:', error);
		}
	}

	async function sendMessage() {
		if (!inputText.trim() || isLoading) return;

		const userMessage: Message = {
			role: 'user',
			content: inputText.trim(),
			timestamp: Date.now()
		};

		messages = [...messages, userMessage];
		const messageText = inputText;
		inputText = '';
		isLoading = true;

		scrollToBottom();

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: messageText,
					sessionId
				})
			});

			if (response.ok) {
				const data = await response.json();
				const assistantMessage: Message = {
					role: 'assistant',
					content: data.text,
					components: data.components,
					timestamp: Date.now()
				};
				messages = [...messages, assistantMessage];
				scrollToBottom();
			} else {
				console.error('Chat API error:', await response.text());
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 100);
	}

	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="chat-mode">
	<!-- Header -->
	<div class="chat-header">
		<h2>Interactive Chat</h2>
		<button class="close-button" onclick={onClose} aria-label="Close chat">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	</div>

	<!-- Messages -->
	<div class="messages-container" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<div class="empty-state">
				<p>Start a conversation to refine your presentation</p>
				<p class="hint">Try: "Add a chart showing renewable energy growth"</p>
			</div>
		{:else}
			{#each messages as message (message.timestamp)}
				<div class="message {message.role}">
					<div class="message-header">
						<span class="role">{message.role === 'user' ? 'You' : 'AI Assistant'}</span>
						<span class="time">{formatTime(message.timestamp)}</span>
					</div>
					<div class="message-content">
						<p>{message.content}</p>
						{#if message.components && message.components.length > 0}
							<div class="components">
								{#each message.components as component (component.id)}
									<div class="component-preview">
										<ComponentRenderer {component} />
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		{/if}

		{#if isLoading}
			<div class="message assistant loading">
				<div class="message-header">
					<span class="role">AI Assistant</span>
				</div>
				<div class="message-content">
					<div class="typing-indicator">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="chat-input">
		<textarea
			bind:this={inputElement}
			bind:value={inputText}
			onkeydown={handleKeydown}
			placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
			rows="3"
			disabled={isLoading}
		></textarea>
		<button onclick={sendMessage} disabled={!inputText.trim() || isLoading} class="send-button">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			Send
		</button>
	</div>
</div>

<style>
	.chat-mode {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--color-background, #ffffff);
		color: var(--color-text, #1a1a1a);
	}

	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border, #e5e5e5);
		background: var(--color-surface, #f9f9f9);
	}

	.chat-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		color: var(--color-text-secondary, #666);
		transition: color 0.2s;
	}

	.close-button:hover {
		color: var(--color-text, #1a1a1a);
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: var(--color-text-secondary, #666);
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	.empty-state .hint {
		font-size: 0.875rem;
		font-style: italic;
		color: var(--color-text-tertiary, #999);
	}

	.message {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 80%;
	}

	.message.user {
		align-self: flex-end;
	}

	.message.assistant {
		align-self: flex-start;
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary, #666);
	}

	.message.user .message-header {
		flex-direction: row-reverse;
	}

	.role {
		font-weight: 600;
	}

	.time {
		opacity: 0.7;
	}

	.message-content {
		background: var(--color-surface, #f9f9f9);
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		word-wrap: break-word;
	}

	.message.user .message-content {
		background: var(--color-primary, #3b82f6);
		color: white;
	}

	.message-content p {
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.components {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.component-preview {
		background: var(--color-background, #ffffff);
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border, #e5e5e5);
	}

	.typing-indicator {
		display: flex;
		gap: 0.25rem;
		padding: 0.5rem 0;
	}

	.typing-indicator span {
		width: 0.5rem;
		height: 0.5rem;
		background: var(--color-text-secondary, #666);
		border-radius: 50%;
		animation: typing 1.4s infinite;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing {
		0%, 60%, 100% {
			opacity: 0.3;
			transform: translateY(0);
		}
		30% {
			opacity: 1;
			transform: translateY(-0.25rem);
		}
	}

	.chat-input {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border, #e5e5e5);
		background: var(--color-surface, #f9f9f9);
	}

	.chat-input textarea {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.875rem;
		resize: none;
		background: var(--color-background, #ffffff);
		color: var(--color-text, #1a1a1a);
	}

	.chat-input textarea:focus {
		outline: none;
		border-color: var(--color-primary, #3b82f6);
	}

	.chat-input textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.send-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.send-button:hover:not(:disabled) {
		background: var(--color-primary-dark, #2563eb);
	}

	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
