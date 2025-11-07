<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { presentationStore } from '$lib/stores/presentation.svelte';
	import ComponentRenderer from '$lib/components/ComponentRenderer.svelte';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import SlideHeader from '$lib/components/SlideHeader.svelte';
	import SlideFooter from '$lib/components/SlideFooter.svelte';
	import ChatMode from '$lib/components/ChatMode.svelte';
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
	let chatInputElement = $state<HTMLTextAreaElement | undefined>(undefined);
	let showShortcuts = $state(false); // Hidden by default
	let showDebugPanel = $state(false);
	let showChatMode = $state(false); // Toggle for interactive chat mode
	let contentContainer: HTMLDivElement;
	let autoScrollInterval: NodeJS.Timeout | null = null;
	let streamComplete = $state(true); // Track if the streaming response is complete

	// Always start from top to avoid jarring repositioning when content is added
	// Content will naturally center itself if it's minimal (via flex/justify-center on the component container)
	const shouldCenterContent = $derived(() => false);

	// Get slide info
	const slideInfo = $derived(presentationStore.getSlideInfo());
	const progress = $derived(presentationStore.getProgress());
	
	// Track current slide title from components
	const currentSlideTitle = $derived(() => {
		const components = presentationStore.state.components;
		if (components.length === 0) return '';
		
		// Look for title in various component types
		const titleComponent = components.find(c => 
			(c.type === 'title-slide' && 'title' in c) ||
			(c.type === 'section-divider' && 'title' in c) ||
			(c.type === 'content-slide' && 'header' in c && c.header?.title) ||
			(c.type === 'text' && c.variant === 'heading')
		);
		
		if (!titleComponent) return '';
		
		if (titleComponent.type === 'title-slide' || titleComponent.type === 'section-divider') {
			return titleComponent.title;
		} else if (titleComponent.type === 'content-slide' && titleComponent.header) {
			return titleComponent.header.title;
		} else if (titleComponent.type === 'text') {
			return titleComponent.content;
		}
		
		return '';
	});

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
		} else if (event.code === 'KeyC') {
			// C key - toggle chat mode
			event.preventDefault();
			showChatMode = !showChatMode;
			if (showChatMode) {
				presentationStore.pause();
			} else {
				presentationStore.resume();
			}
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

{#if showChatMode}
	<!-- Chat Mode -->
	<ChatMode 
		sessionId={data.sessionId} 
		onClose={() => {
			showChatMode = false;
			presentationStore.resume();
		}}
	/>
{:else}
	<!-- Presentation Mode -->
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

	<!-- Persistent Header -->
	{#if presentationStore.state.components.length > 0}
		<div class="w-full border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm z-20">
			<SlideHeader 
				title={currentSlideTitle()} 
				variant="minimal"
			/>
		</div>
	{/if}

	<!-- Main presentation area -->
	<div
		bind:this={contentContainer}
		class="flex-1 w-full flex justify-center items-center p-8 relative z-10 overflow-y-auto scroll-smooth transition-all duration-300 ease-out"
	>
		<div class="w-full max-w-7xl mx-auto transition-all duration-300 ease-out">
			{#if presentationStore.isProcessing}
				<!-- Loading animation -->
				<LoadingAnimation message="Processing your request..." />
			{:else if presentationStore.state.components.length > 0}
				<div class="flex flex-col items-center justify-center gap-8 w-full transition-all duration-300 ease-out">
					{#each presentationStore.state.components as component, index (`${component.id}-${index}`)}
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

	<!-- Persistent Footer -->
	{#if presentationStore.state.components.length > 0}
		<div class="w-full border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm z-20">
			<SlideFooter 
				text="AI Presentation"
				showPageNumber={true}
				pageNumber={slideInfo.currentSlide}
				totalPages={slideInfo.totalSlides}
				variant="default"
			/>
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
				<p><kbd class="bg-white text-black px-2 py-1 rounded text-xs">C</kbd> Chat Mode: {showChatMode ? '✅' : '❌'}</p>
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
						<p class="truncate">Voice: {presentationStore.availableVoices[presentationStore.selectedVoiceIndex]}</p>
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
{/if}
