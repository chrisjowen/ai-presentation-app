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
	let currentSlide = $state<Component | null>(null);
	let isListening = $state(false);
	let isProcessing = $state(false);
	let recognition: any = null;
	let textInput = $state('');
	let showInput = $state(false);
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

		isProcessing = true;
		showInput = false; // Hide input after submission

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

				// Update the single slide with the latest component
				if (data.components && data.components.length > 0) {
					// Take the first component as the current slide
					currentSlide = data.components[0];
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

	async function speakText(text: string) {
		try {
			// Use OpenAI TTS API
			const response = await fetch('/api/tts/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});

			if (response.ok) {
				const audioBlob = await response.blob();
				const audioUrl = URL.createObjectURL(audioBlob);
				const audio = new Audio(audioUrl);
				audio.play();
				
				// Clean up URL after playing
				audio.onended = () => URL.revokeObjectURL(audioUrl);
			}
		} catch (error) {
			console.error('TTS error:', error);
		}
	}

	function handleTextSubmit() {
		if (textInput.trim()) {
			handleUserInput(textInput);
			textInput = '';
			showInput = false;
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

	<!-- Main Content - Single Slide -->
	<div class="pt-24 pb-32 px-8 flex items-center justify-center min-h-[calc(100vh-12rem)]">
		<div class="max-w-5xl w-full">
			{#if currentSlide}
				<div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-12 transition-all duration-500">
					<ComponentRenderer component={currentSlide} />
				</div>
			{:else}
				<div class="text-center py-20">
					<div class="text-8xl mb-8">🎙️</div>
					<h2 class="text-4xl font-bold mb-4">Start a Conversation</h2>
					<p class="text-xl text-slate-400">
						Click the microphone or hover at the bottom to begin
					</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Input Control (Hidden at Bottom, Shows on Hover) -->
	<div 
		class="fixed bottom-0 left-0 right-0 transition-all duration-300"
		class:translate-y-full={!showInput && !isListening && !isProcessing}
		class:translate-y-0={showInput || isListening || isProcessing}
		bind:this={inputContainer}
		onmouseenter={() => showInput = true}
		onmouseleave={() => !textInput && (showInput = false)}
	>
		<div class="bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
			<div class="max-w-7xl mx-auto px-8 py-6">
				<!-- Voice Button -->
				<div class="flex items-center justify-center gap-4 mb-4">
					<button
						onclick={toggleListening}
						disabled={isProcessing}
						class="w-16 h-16 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
						class:bg-red-600={isListening}
						class:hover:bg-red-700={isListening}
						class:bg-blue-600={!isListening}
						class:hover:bg-blue-700={!isListening}
						class:animate-pulse={isListening}
					>
						<svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
						</svg>
					</button>

					{#if isProcessing}
						<div class="text-slate-400 animate-pulse text-sm">Processing...</div>
					{:else if isListening}
						<div class="text-red-400 animate-pulse text-sm">Listening...</div>
					{/if}
				</div>

				<!-- Text Input -->
				<div class="flex gap-3">
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
			</div>
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
