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
	let showModal = $state(false);
	let modalInput: HTMLInputElement;

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

		// Keyboard shortcut: Cmd+E or Ctrl+E
		const handleKeydown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
				e.preventDefault();
				showModal = true;
				setTimeout(() => modalInput?.focus(), 100);
			}
			if (e.key === 'Escape' && showModal) {
				showModal = false;
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
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
		showModal = false; // Hide modal after submission

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
				body: JSON.stringify({ 
					text,
					voice: 'nova',
					speed: 1.0
				})
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
		}
	}

	function handleModalKeydown(event: KeyboardEvent) {
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

	<!-- Voice Button (Fixed Bottom Center) -->
	<div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
		<button
			onclick={toggleListening}
			disabled={isProcessing}
			class="w-20 h-20 rounded-full shadow-2xl transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
			<div class="absolute -top-12 left-1/2 -translate-x-1/2 text-slate-400 animate-pulse text-sm whitespace-nowrap">
				Processing...
			</div>
		{:else if isListening}
			<div class="absolute -top-12 left-1/2 -translate-x-1/2 text-red-400 animate-pulse text-sm whitespace-nowrap">
				Listening...
			</div>
		{/if}
	</div>

	<!-- Spotlight Modal (Cmd+E) -->
	{#if showModal}
		<div 
			class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
			onclick={() => showModal = false}
		>
			<div 
				class="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="flex items-center gap-4 p-6">
					<svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
					</svg>
					<input
						bind:this={modalInput}
						type="text"
						bind:value={textInput}
						onkeydown={handleModalKeydown}
						placeholder="Ask anything..."
						class="flex-1 bg-transparent text-white text-lg placeholder-slate-500 focus:outline-none"
					/>
					<button
						onclick={handleTextSubmit}
						disabled={!textInput.trim() || isProcessing}
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Send
					</button>
				</div>
				<div class="px-6 pb-4 text-xs text-slate-500">
					Press <kbd class="px-2 py-1 bg-slate-800 rounded">Enter</kbd> to send • <kbd class="px-2 py-1 bg-slate-800 rounded">Esc</kbd> to close
				</div>
			</div>
		</div>
	{/if}
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
