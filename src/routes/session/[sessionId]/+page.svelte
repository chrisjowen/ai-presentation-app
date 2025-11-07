<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { presentationStore } from '$lib/stores/presentation.svelte';
	import ComponentRenderer from '$lib/components/ComponentRenderer.svelte';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import type { Presentation } from '$lib/types/timeline';
	import { THEMES } from '$lib/types/theme';
	import { AVAILABLE_MODELS, getModelById } from '$lib/types/models';

	interface Props {
		data: {
			sessionId: string;
			presentation: Presentation | null;
		};
	}

	let { data }: Props = $props();

	// Get current theme
	const currentTheme = $derived(
		presentationStore.currentPresentation?.theme
			? THEMES[presentationStore.currentPresentation.theme] || THEMES.default
			: THEMES.default
	);

	let isListening = $state(false);
	let recognition: any = null;
	let showQuickChat = $state(false);
	let chatInput = $state('');
	let chatInputElement: HTMLTextAreaElement;
	let showShortcuts = $state(false); // Hidden by default
	let showDebugPanel = $state(false);
	let contentContainer: HTMLDivElement;
	let autoScrollInterval: NodeJS.Timeout | null = null;
	let streamComplete = $state(true); // Track if the streaming response is complete

	// Determine if we should center content vertically (simple slides only)
	const shouldCenterContent = $derived(() => {
		const components = presentationStore.state.components;
		if (components.length === 0) return true;

		// Center if only text/quote components (no images, grids, or complex layouts)
		const simpleTypes = ['text', 'quote'];
		const hasComplexLayout = components.some(c =>
			!simpleTypes.includes(c.type) ||
			(c.type === 'text' && c.variant === 'body') // Body text suggests multi-element slide
		);

		return !hasComplexLayout && components.length <= 2; // Max 2 simple components to center
	});

	// Get slide info
	const slideInfo = $derived(presentationStore.getSlideInfo());
	const progress = $derived(presentationStore.getProgress());

	// Auto-scroll for overflow content
	$effect(() => {
		if (contentContainer && presentationStore.state.components.length > 0) {
			// Reset scroll to top when slide clears (new content starts)
			if (presentationStore.state.components.length === 1) {
				contentContainer.scrollTop = 0;
				// Clear any existing scroll interval when slide resets
				if (autoScrollInterval) {
					clearInterval(autoScrollInterval);
					autoScrollInterval = null;
				}
			}

			// Check if content overflows viewport
			const isOverflowing = contentContainer.scrollHeight > contentContainer.clientHeight;

			// Start auto-scroll if content overflows and not already scrolling
			if (isOverflowing && !autoScrollInterval) {
				// Delay before starting scroll (let content render and user see top)
				setTimeout(() => {
					// Double-check still overflowing and not already scrolling
					if (contentContainer && !autoScrollInterval) {
						const stillOverflowing = contentContainer.scrollHeight > contentContainer.clientHeight;

						if (stillOverflowing) {
							// Start auto-scroll with medium speed
							autoScrollInterval = setInterval(() => {
								if (contentContainer) {
									const maxScroll = contentContainer.scrollHeight - contentContainer.clientHeight;
									const currentScroll = contentContainer.scrollTop;

									if (currentScroll < maxScroll) {
										// Scroll down smoothly (2 pixels per frame = ~120px per second at 60fps)
										contentContainer.scrollTop += 2;
									} else {
										// Reached bottom, stop auto-scroll
										if (autoScrollInterval) {
											clearInterval(autoScrollInterval);
											autoScrollInterval = null;
										}
									}
								}
							}, 16); // ~60fps
						}
					}
				}, 1500); // Wait 1.5s before starting scroll
			}
		}

		return () => {
			if (autoScrollInterval) {
				clearInterval(autoScrollInterval);
				autoScrollInterval = null;
			}
		};
	});

	// Initialize presentation if available
	onMount(() => {
		console.log('[SessionPage] Mounted with presentation:', data.presentation ? 'YES' : 'NO');
		if (data.presentation) {
			console.log('[SessionPage] Initial presentation events:', data.presentation.events.length);
			presentationStore.loadPresentation(data.presentation);
			presentationStore.play();
		} else {
			// New session with no presentation - show quick chat popup
			openQuickChat();
		}

		// Setup speech recognition
		if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
			// @ts-ignore
			recognition = new webkitSpeechRecognition();
			recognition.continuous = false;
			recognition.interimResults = false;

			recognition.onresult = (event: any) => {
				const transcript = event.results[0][0].transcript;
				handleUserSpeech(transcript);
			};

			recognition.onend = () => {
				isListening = false;
			};
		}
	});

	onDestroy(() => {
		presentationStore.stop();
		if (recognition) {
			recognition.stop();
		}
	});

	// Handle keyboard events
	function handleKeyDown(event: KeyboardEvent) {
		// If chat is open, don't handle other shortcuts (except Escape)
		if (showQuickChat) {
			if (event.code === 'Escape') {
				event.preventDefault();
				closeQuickChat();
			}
			return;
		}

		if (event.code === 'Space') {
			event.preventDefault();
			// Start listening when space is pressed
			if (!isListening) {
				startListening();
			}
		} else if (event.code === 'Slash') {
			// / key - open quick chat
			event.preventDefault();
			openQuickChat();
		} else if (event.code === 'KeyK' && (event.metaKey || event.ctrlKey)) {
			// Cmd/Ctrl+K - open quick chat
			event.preventDefault();
			openQuickChat();
		} else if (event.code === 'KeyS') {
			// S key - toggle shortcuts menu
			event.preventDefault();
			showShortcuts = !showShortcuts;
		} else if (event.code === 'KeyD') {
			// D key - toggle debug panel
			event.preventDefault();
			showDebugPanel = !showDebugPanel;
		} else if (event.code === 'KeyA') {
			// A key - toggle auto-advance
			event.preventDefault();
			presentationStore.toggleAutoAdvance();
		} else if (event.code === 'ArrowLeft') {
			// Left arrow - previous slide
			event.preventDefault();
			presentationStore.previousSlide();
		} else if (event.code === 'ArrowRight') {
			// Right arrow - next slide
			event.preventDefault();
			presentationStore.nextSlide();
		} else if (event.code === 'KeyV') {
			// V key - cycle voice
			event.preventDefault();
			presentationStore.cycleVoice();
		} else if (event.code === 'Equal' || event.code === 'NumpadAdd') {
			// + key - speed up
			event.preventDefault();
			presentationStore.adjustSpeed(0.1);
		} else if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
			// - key - slow down
			event.preventDefault();
			presentationStore.adjustSpeed(-0.1);
		} else if (event.code === 'KeyN') {
			// N key - new session
			event.preventDefault();
			createNewSession();
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (showQuickChat) return; // Don't handle if chat is open

		if (event.code === 'Space') {
			event.preventDefault();
			// Stop listening when space is released
			if (isListening) {
				stopListening();
			}
		}
	}

	function openQuickChat() {
		showQuickChat = true;
		presentationStore.pause();
		// Focus input after render
		setTimeout(() => {
			chatInputElement?.focus();
		}, 50);
	}

	function closeQuickChat() {
		showQuickChat = false;
		chatInput = '';
		presentationStore.resume();
	}

	async function createNewSession() {
		try {
			// Create a new session
			const response = await fetch('/api/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				const { sessionId } = await response.json();
				// Navigate to new session
				window.location.href = `/session/${sessionId}`;
			}
		} catch (error) {
			console.error('Failed to create new session:', error);
		}
	}

	function handleTextareaKeydown(event: KeyboardEvent) {
		// Submit on Enter (without Shift)
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleChatSubmit(event as any);
		}
	}

	async function handleChatSubmit(event: Event) {
		event.preventDefault();
		if (!chatInput.trim()) return;

		const message = chatInput.trim();
		closeQuickChat();

		// Set processing state and mark stream as incomplete
		streamComplete = false;
		presentationStore.setProcessing(true);

		// Use streaming endpoint for real-time updates
		try {
			const response = await fetch(`/api/sessions/${data.sessionId}/stream`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message, modelId: presentationStore.selectedModelId })
			});

			if (response.ok && response.body) {
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let isDone = false;

				while (!isDone) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6);
							if (data === '[DONE]') {
								streamComplete = true;
								presentationStore.setProcessing(false);
								isDone = true;
								break;
							}

							try {
								const presentation = JSON.parse(data);
								// Update presentation in real-time as chunks arrive
								presentationStore.updateFromServer(presentation);
							} catch (e) {
								// Ignore parse errors for partial data
							}
						}
					}
				}

				// Close the reader
				reader.cancel();
			} else {
				streamComplete = true;
				presentationStore.setProcessing(false);
			}
		} catch (error) {
			console.error('Failed to send message:', error);
			streamComplete = true;
			presentationStore.setProcessing(false);
		}
	}

	function startListening() {
		if (!recognition) return;
		presentationStore.pause();
		isListening = true;
		recognition.start();
	}

	function stopListening() {
		if (!recognition) return;
		recognition.stop();
		isListening = false;
		presentationStore.resume();
	}

	function toggleListening() {
		if (!recognition) return;

		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	}

	async function handleUserSpeech(transcript: string) {
		console.log('User said:', transcript);

		// Set processing state and mark stream as incomplete
		streamComplete = false;
		presentationStore.setProcessing(true);

		// Use streaming endpoint for real-time updates
		try {
			const response = await fetch(`/api/sessions/${data.sessionId}/stream`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: transcript, modelId: presentationStore.selectedModelId })
			});

			if (response.ok && response.body) {
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let isDone = false;

				while (!isDone) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6);
							if (data === '[DONE]') {
								streamComplete = true;
								presentationStore.setProcessing(false);
								isDone = true;
								break;
							}

							try {
								const presentation = JSON.parse(data);
								// Update presentation in real-time as chunks arrive
								presentationStore.updateFromServer(presentation);
							} catch (e) {
								// Ignore parse errors for partial data
							}
						}
					}
				}

				// Close the reader
				reader.cancel();
			} else {
				streamComplete = true;
				presentationStore.setProcessing(false);
			}
		} catch (error) {
			console.error('Failed to send message:', error);
			streamComplete = true;
			presentationStore.setProcessing(false);
		}

		isListening = false;
	}

	// Polling disabled - using SSE streaming instead
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div
	class="w-screen h-screen overflow-hidden flex flex-col"
	style={`
		${currentTheme.background.type === 'color' ? `background: ${currentTheme.background.value};` : ''}
		${currentTheme.background.type === 'gradient' ? `background: ${currentTheme.background.value};` : ''}
		${currentTheme.background.type === 'image' ? `background: url(${currentTheme.background.value}) center/cover;` : ''}
		color: ${currentTheme.colors.text};
	`}
>
	<!-- Background overlay if specified -->
	{#if currentTheme.background.overlay}
		<div class="absolute inset-0 pointer-events-none" style={`background: ${currentTheme.background.overlay};`}></div>
	{/if}

	<!-- Header -->
	{#if currentTheme.header}
		<div
			class={`w-full flex items-center justify-center z-10 ${currentTheme.header.className || ''}`}
			style={`height: ${currentTheme.header.height || '80px'};`}
		>
			{#if currentTheme.header.content}
				<div class="text-xl font-semibold">{currentTheme.header.content}</div>
			{/if}
		</div>
	{/if}

	<!-- Main presentation area -->
	<div
		bind:this={contentContainer}
		class="flex-1 w-full flex justify-center p-8 relative z-10 overflow-y-auto scroll-smooth"
		class:items-center={shouldCenterContent()}
		class:items-start={!shouldCenterContent()}
	>
		<div class="w-full max-w-7xl mx-auto" class:min-h-full={shouldCenterContent()} class:flex={shouldCenterContent()} class:items-center={shouldCenterContent()} class:justify-center={shouldCenterContent()}>
			{#if presentationStore.isProcessing}
				<!-- Loading animation -->
				<LoadingAnimation message="Processing your request..." />
			{:else if presentationStore.state.components.length > 0}
				<div class="flex flex-col items-center gap-8" class:justify-center={shouldCenterContent()} class:w-full={!shouldCenterContent()}>
					{#each presentationStore.state.components as component (component.id)}
						<ComponentRenderer {component} transition={component.transition || 'fade'} />
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center h-full text-center">
					<h1 class="text-4xl font-bold mb-4">Waiting for input...</h1>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer -->
	{#if currentTheme.footer}
		<div
			class={`w-full flex items-center justify-center z-10 ${currentTheme.footer.className || ''}`}
			style={`height: ${currentTheme.footer.height || '60px'};`}
		>
			{#if currentTheme.footer.content}
				<div class="text-sm opacity-70">{currentTheme.footer.content}</div>
			{/if}
		</div>
	{/if}

	<!-- Status indicators -->
	<div class="fixed bottom-4 right-4 flex gap-2">
		{#if presentationStore.state.isPaused}
			<div class="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold">
				PAUSED
			</div>
		{/if}

		{#if isListening}
			<div class="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold animate-pulse">
				LISTENING...
			</div>
		{/if}
	</div>

	<!-- Loading Spinner / Completed Icon (top right) -->
	{#if presentationStore.isProcessing || (presentationStore.isWaitingForContent && !streamComplete)}
		<!-- Still generating or waiting for more content - show spinning loader -->
		<div class="fixed top-4 right-4 z-50">
			<div class="relative">
				<div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				<div class="absolute inset-0 w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
			</div>
		</div>
	{:else if presentationStore.isWaitingForContent && streamComplete}
		<!-- Stream complete and waiting - show completed icon -->
		<div class="fixed top-4 right-4 z-50">
			<div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center">
				<svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
				</svg>
			</div>
		</div>
	{/if}

	<!-- Floating Robot with Speech Bubble -->
	{#if presentationStore.currentSpeakText}
		<div class="fixed bottom-20 right-8 z-50 flex items-end gap-3">
			<!-- Speech Bubble -->
			<div class="relative max-w-md bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-2xl">
				<!-- Tail -->
				<div class="absolute bottom-4 -right-2 w-4 h-4 bg-white transform rotate-45"></div>

				<!-- Text (larger, no highlighting) -->
				<p class="text-lg leading-relaxed relative z-10 font-medium">
					{presentationStore.currentSpeakText}
				</p>
			</div>

			<!-- Robot Avatar -->
			<div class="relative flex-shrink-0">
				<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center animate-bounce-subtle">
					<span class="text-3xl">🤖</span>
				</div>
				<!-- Talking indicator -->
				<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
			</div>
		</div>
	{/if}

	<!-- Instructions & Voice Settings -->
	{#if showShortcuts}
		<div class="fixed bottom-4 left-4 bg-black bg-opacity-50 px-4 py-3 rounded-lg max-w-md z-40 transition-all">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-bold">Shortcuts</h3>
				<button onclick={() => showShortcuts = false} class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
			</div>
			<div class="text-sm space-y-1">
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">Space</kbd> Hold to Speak</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">/</kbd> or <kbd class="bg-white text-black px-2 py-1 rounded text-xs">⌘K</kbd> Quick Chat</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">N</kbd> New Session</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">←→</kbd> Navigate Slides</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">A</kbd> Auto-advance: {presentationStore.autoAdvance ? '✅' : '❌'}</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">D</kbd> Debug Panel: {showDebugPanel ? '✅' : '❌'}</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">S</kbd> Toggle Shortcuts</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">V</kbd> Change Voice</p>
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">+/-</kbd> Speed</p>
			</div>
			<div class="mt-2 pt-2 border-t border-gray-600 text-xs">
				<!-- Model Selection -->
				<div class="mb-3">
					<label class="block text-gray-300 font-semibold mb-1">AI Model:</label>
					<select
						bind:value={presentationStore.selectedModelId}
						class="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs border border-slate-600 focus:outline-none focus:border-blue-500"
					>
						{#each AVAILABLE_MODELS as model}
							<option value={model.id}>
								{model.icon} {model.name}
							</option>
						{/each}
					</select>
					<div class="text-gray-500 text-xs mt-1">
						{getModelById(presentationStore.selectedModelId)?.description || ''}
					</div>
				</div>

				<!-- Voice Settings -->
				<div class="text-gray-400">
					<p>Speed: {presentationStore.voiceRate.toFixed(1)}x</p>
					{#if presentationStore.availableVoices[presentationStore.selectedVoiceIndex]}
						<p class="truncate">Voice: {presentationStore.availableVoices[presentationStore.selectedVoiceIndex].name}</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<!-- Minimized shortcuts button -->
		<button
			onclick={() => showShortcuts = true}
			class="fixed bottom-4 left-4 bg-black bg-opacity-50 hover:bg-opacity-70 px-4 py-3 rounded-lg text-sm z-40 transition-all"
		>
			⌨️ Shortcuts (S)
		</button>
	{/if}

	<!-- Quick Chat Overlay -->
	{#if showQuickChat}
		<div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onclick={closeQuickChat}>
			<div class="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6" onclick={(e) => e.stopPropagation()}>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-2xl font-bold">Quick Question</h2>
					<button onclick={closeQuickChat} class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
				</div>

				<form onsubmit={handleChatSubmit}>
					<textarea
						bind:this={chatInputElement}
						bind:value={chatInput}
						onkeydown={handleTextareaKeydown}
						placeholder="Type your question and press Enter...&#10;(Shift+Enter for new line)"
						class="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none"
						rows="4"
						autocomplete="off"
					></textarea>

					<div class="mt-4 flex justify-between items-center text-sm text-gray-400">
						<span>Press <kbd class="bg-slate-700 px-2 py-1 rounded text-xs">Enter</kbd> to send, <kbd class="bg-slate-700 px-2 py-1 rounded text-xs">Shift+Enter</kbd> for new line, <kbd class="bg-slate-700 px-2 py-1 rounded text-xs">Esc</kbd> to cancel</span>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Debug Panel -->
	<DebugPanel isVisible={showDebugPanel} />
</div>
