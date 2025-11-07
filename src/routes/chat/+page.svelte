<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ComponentRenderer from '$lib/components/ComponentRenderer.svelte';
	import type { Component } from '$lib/agent/chat/prompts/types';

	interface Message {
		role: 'user' | 'assistant';
		content: string;
		components?: Component[];
		timestamp: number;
	}

	let sessionId = $state(`chat-${Date.now()}`);
	let messages = $state<Message[]>([]);
	let currentSlides = $state<Component[]>([]);
	let isListening = $state(false);
	let isProcessing = $state(false);
	let recognition: any = null;
	let textInput = $state('');
	let showTextInput = $state(false);
	let inputContainer: HTMLDivElement;

	onMount(() => {
		// Initialize speech recognition
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
			recognition = new SpeechRecognition();
			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = 'en-US';

			recognition.onresult = (event: any) => {
				const transcript = event.results[0][0].transcript;
				handleUserInput(transcript);
			};

			recognition.onerror = (event: any) => {
				console.error('Speech recognition error:', event.error);
				isListening = false;
			};

			recognition.onend = () => {
				isListening = false;
			};
		}
	});

	onDestroy(() => {
		if (recognition) {
			recognition.stop();
		}
	});

	function toggleListening() {
		if (!recognition) {
			alert('Speech recognition not supported in this browser');
			return;
		}

		if (isListening) {
			recognition.stop();
			isListening = false;
		} else {
			recognition.start();
			isListening = true;
		}
	}

	async function handleUserInput(input: string) {
		if (!input.trim() || isProcessing) return;

		const userMessage: Message = {
			role: 'user',
			content: input,
			timestamp: Date.now()
		};

		messages = [...messages, userMessage];
		isProcessing = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: input,
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

				// Update current slides with new components
				if (data.components && data.components.length > 0) {
					currentSlides = data.components.slice(0, 2); // Show max 2 slides at a time
				}

				// Speak the response
				speakText(data.text);
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			isProcessing = false;
		}
	}

	function speakText(text: string) {
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.0;
			utterance.pitch = 1.0;
			window.speechSynthesis.speak(utterance);
		}
	}

	function handleTextSubmit() {
		if (textInput.trim()) {
			handleUserInput(textInput);
			textInput = '';
			showTextInput = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleTextSubmit();
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
	<!-- Header -->
	<div class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
		<div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
			<a href="/" class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
				AI Explainer
			</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-slate-400">Voice Chat Mode</span>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="pt-24 pb-32 px-8">
		<div class="max-w-7xl mx-auto">
			<!-- Presentation Area -->
			{#if currentSlides.length > 0}
				<div class="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
					{#each currentSlides as slide (slide.id)}
						<div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8 hover:bg-slate-900/70 transition-all">
							<ComponentRenderer component={slide} />
						</div>
					{/each}
				</div>
			{:else}
				<div class="mb-12 text-center py-20">
					<div class="text-6xl mb-6">🎙️</div>
					<h2 class="text-3xl font-bold mb-4">Start a Voice Conversation</h2>
					<p class="text-xl text-slate-400 mb-8">
						Click the microphone button below to begin
					</p>
				</div>
			{/if}

			<!-- Recent Messages (subtle, not chat-like) -->
			{#if messages.length > 0}
				<div class="mb-8 space-y-4">
					{#each messages.slice(-3) as message (message.timestamp)}
						<div class="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4">
							<div class="flex items-start gap-3">
								<div class="text-2xl">{message.role === 'user' ? '👤' : '🤖'}</div>
								<div class="flex-1">
									<p class="text-slate-300">{message.content}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Voice Control (Fixed Bottom) -->
	<div 
		class="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800"
		bind:this={inputContainer}
		onmouseenter={() => showTextInput = true}
		onmouseleave={() => !textInput && (showTextInput = false)}
	>
		<div class="max-w-7xl mx-auto px-8 py-6">
			<!-- Voice Button -->
			<div class="flex items-center justify-center gap-4 mb-4">
				<button
					onclick={toggleListening}
					disabled={isProcessing}
					class="w-20 h-20 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
					class:bg-red-600={isListening}
					class:hover:bg-red-700={isListening}
					class:bg-blue-600={!isListening}
					class:hover:bg-blue-700={!isListening}
					class:animate-pulse={isListening}
				>
					<svg class="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
					</svg>
				</button>

				{#if isProcessing}
					<div class="text-slate-400 animate-pulse">Processing...</div>
				{:else if isListening}
					<div class="text-red-400 animate-pulse">Listening...</div>
				{:else}
					<div class="text-slate-400">Click to speak</div>
				{/if}
			</div>

			<!-- Text Input (Shows on Hover) -->
			{#if showTextInput}
				<div class="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
					<input
						type="text"
						bind:value={textInput}
						onkeydown={handleKeydown}
						placeholder="Or type your message..."
						class="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
					/>
					<button
						onclick={handleTextSubmit}
						disabled={!textInput.trim() || isProcessing}
						class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Send
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes slide-in-from-bottom-4 {
		from {
			transform: translateY(1rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-in {
		animation: slide-in-from-bottom-4 0.2s ease-out;
	}

	.fade-in {
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
