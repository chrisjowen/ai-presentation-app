/**
 * Presentation Store
 * Manages presentation state and timeline orchestration
 */

import type { Component } from '$lib/types/components';
import type { Presentation, TimelineEvent, PresentationState } from '$lib/types/timeline';
import { DEFAULT_MODEL_ID } from '$lib/types/models';
import type { OpenAIVoice } from '$lib/types/tts';
import { ttsService } from '$lib/services/tts-service';

export interface DebugLog {
	id: string;
	timestamp: number;
	type: 'user_message' | 'llm_request' | 'llm_response' | 'tool_call' | 'tool_result' | 'error';
	data: any;
}

class PresentationStore {
	state = $state<PresentationState>({
		components: [],
		currentEventIndex: 0,
		isPlaying: false,
		isPaused: false
	});

	currentPresentation = $state<Presentation | null>(null);
	currentAudio: HTMLAudioElement | null = null;
	timeoutId: number | null = null;

	// Voice settings (OpenAI TTS)
	voiceRate = $state(1.0); // Speed (1.0 = normal)
	availableVoices = $state<OpenAIVoice[]>(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']);
	selectedVoiceIndex = $state(0);

	// Navigation settings
	autoAdvance = $state(true); // Whether to automatically advance through slides
	isProcessing = $state(false); // Whether AI is processing a request

	// Model selection
	selectedModelId = $state(DEFAULT_MODEL_ID);

	// Current speech text (for subtitle display)
	currentSpeakText = $state<string>('');
	isWaitingForContent = $state<boolean>(false); // True when slide ended but waiting for next content

	// Debug logs
	debugLogs = $state<DebugLog[]>([]);

	constructor() {
		// No initialization needed for OpenAI TTS
	}

	cycleVoice() {
		this.selectedVoiceIndex = (this.selectedVoiceIndex + 1) % this.availableVoices.length;
		console.log('[PresentationStore] Voice changed to:', this.availableVoices[this.selectedVoiceIndex]);
	}

	adjustSpeed(delta: number) {
		this.voiceRate = Math.max(0.5, Math.min(2.0, this.voiceRate + delta));
		console.log('[PresentationStore] Voice rate:', this.voiceRate);
	}

	// Load a new presentation
	loadPresentation(presentation: Presentation) {
		console.log('[PresentationStore] Loading presentation with', presentation.events.length, 'events');
		console.log('[PresentationStore] Events:', JSON.stringify(presentation.events, null, 2));
		this.stop();
		this.currentPresentation = presentation;
		this.state.components = [];
		this.state.currentEventIndex = 0;
		this.state.isPlaying = false;
		this.state.isPaused = false;
	}

	// Start playing the presentation
	async play() {
		if (!this.currentPresentation) {
			console.log('[PresentationStore] No presentation to play');
			return;
		}

		console.log('[PresentationStore] Starting playback...');
		this.state.isPlaying = true;
		this.state.isPaused = false;

		await this.processEvents();
	}

	// Pause the presentation
	pause() {
		this.state.isPaused = true;
		this.state.isPlaying = false;

		// Pause audio if active
		if (this.currentAudio && !this.currentAudio.paused) {
			this.currentAudio.pause();
		}

		// Clear any pending timeouts
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	// Resume from pause
	resume() {
		if (!this.state.isPaused) return;

		this.state.isPaused = false;
		this.state.isPlaying = true;

		// Resume audio if paused
		if (this.currentAudio && this.currentAudio.paused) {
			this.currentAudio.play();
		}

		// Continue processing events
		this.processEvents();
	}

	// Stop the presentation completely
	stop() {
		this.state.isPlaying = false;
		this.state.isPaused = false;

		// Stop audio
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}

		// Clear timeouts
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	// Process timeline events sequentially
	private async processEvents() {
		if (!this.currentPresentation) return;

		while (
			this.state.currentEventIndex < this.currentPresentation.events.length &&
			this.state.isPlaying &&
			!this.state.isPaused
		) {
			const event = this.currentPresentation.events[this.state.currentEventIndex];

			// Wait for timestamp delay if specified
			if (event.timestamp) {
				await this.delay(event.timestamp);
			}

			// Skip if paused during delay
			if (this.state.isPaused) break;

			// Execute event
			await this.executeEvent(event);

			this.state.currentEventIndex++;
		}

		// Presentation finished or waiting for more content
		if (this.state.currentEventIndex >= this.currentPresentation.events.length) {
			this.state.isPlaying = false;
			this.isWaitingForContent = true; // Show loading when slide ends
		}
	}

	// Execute a single timeline event
	private async executeEvent(event: TimelineEvent) {
		console.log('[PresentationStore] Executing event:', event.type, $state.snapshot(event));

		switch (event.type) {
			case 'add':
				// Store transition with component
				const componentWithTransition = {
					...event.component,
					transition: event.transition || 'fade'
				};
				console.log('[PresentationStore] Adding component:', $state.snapshot(componentWithTransition));
				this.addComponent(componentWithTransition as Component);
				console.log('[PresentationStore] Components after add:', this.state.components.length);
				break;

			case 'update':
				console.log('[PresentationStore] Updating component:', event.componentId);
				this.updateComponent(event.componentId, event.updates);
				break;

			case 'remove':
				console.log('[PresentationStore] Removing component:', event.componentId);
				this.removeComponent(event.componentId);
				break;

			case 'clear':
				console.log('[PresentationStore] Clearing screen');
				this.clearScreen();
				console.log('[PresentationStore] Components after clear:', this.state.components.length);
				break;

			case 'speak':
				console.log('[PresentationStore] Speaking:', event.text?.substring(0, 50));
				await this.speak(event.text, event.rate, event.pitch, event.onWordMarkers);
				break;
		}
	}

	// Component operations
	private addComponent(component: Component) {
		this.state.components = [...this.state.components, component];
	}

	private updateComponent(id: string, updates: Partial<Component>) {
		this.state.components = this.state.components.map((c) =>
			c.id === id ? { ...c, ...updates } : c
		);
	}

	private removeComponent(id: string) {
		this.state.components = this.state.components.filter((c) => c.id !== id);
	}

	private clearScreen() {
		this.state.components = [];
	}

	// Text-to-speech
	private async speak(
		text: string,
		rate?: number,
		pitch: number = 1,
		wordMarkers?: { word: string; eventIndex: number }[]
	): Promise<void> {
		// Set current speak text for subtitle display
		this.currentSpeakText = text;

		try {
			// Get selected voice
			const voice = this.availableVoices[this.selectedVoiceIndex];
			const speed = rate || this.voiceRate;

			// Generate audio using OpenAI TTS
			const audioBlob = await ttsService.generateSpeech(text, voice, speed);
			const audio = await ttsService.createAudioElement(audioBlob);

			this.currentAudio = audio;

			// Play audio and wait for completion
			return new Promise((resolve) => {
				audio.onended = () => {
					this.currentAudio = null;
					this.currentSpeakText = '';
					resolve();
				};

				audio.onerror = (error) => {
					console.error('[PresentationStore] Audio playback error:', error);
					this.currentAudio = null;
					this.currentSpeakText = '';
					resolve();
				};

				audio.play().catch((error) => {
					console.error('[PresentationStore] Audio play error:', error);
					this.currentAudio = null;
					this.currentSpeakText = '';
					resolve();
				});
			});
		} catch (error) {
			console.error('[PresentationStore] TTS generation error:', error);
			this.currentSpeakText = '';
			throw error;
		}
	}

	// Utility
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			this.timeoutId = setTimeout(() => {
				this.timeoutId = null;
				resolve();
			}, ms) as unknown as number;
		});
	}

	// Update presentation from external source
	updateFromServer(presentation: Presentation) {
		console.log('[PresentationStore] Updating from server');
		this.isProcessing = false; // Response received
		this.isWaitingForContent = false; // New content arrived

		// Add debug logs if present
		if (presentation.debugLogs && presentation.debugLogs.length > 0) {
			presentation.debugLogs.forEach(log => {
				this.debugLogs.push(log);
			});
			// Keep only last 50 logs
			if (this.debugLogs.length > 50) {
				this.debugLogs = this.debugLogs.slice(-50);
			}
		}

		// Check if this is an update to existing presentation (streaming)
		if (this.currentPresentation && this.currentPresentation.sessionId === presentation.sessionId) {
			// Streaming update: append new events and continue playing
			const oldEventCount = this.currentPresentation.events.length;
			const newEventCount = presentation.events.length;

			if (newEventCount > oldEventCount) {
				console.log(`[PresentationStore] Streaming update: ${oldEventCount} -> ${newEventCount} events`);

				// Update the presentation data
				this.currentPresentation = presentation;

				// Continue playing from where we were
				// The playback loop will automatically pick up new events
				if (!this.state.isPlaying && this.autoAdvance) {
					this.play();
				}
			} else {
				console.log('[PresentationStore] No new events in update');
			}
		} else {
			// First load: start from beginning
			console.log('[PresentationStore] Initial load');
			this.loadPresentation(presentation);
			// Only auto-play if autoAdvance is enabled
			if (this.autoAdvance) {
				this.play();
			}
		}
	}

	// Set processing state
	setProcessing(processing: boolean) {
		this.isProcessing = processing;
	}

	// Toggle auto-advance
	toggleAutoAdvance() {
		this.autoAdvance = !this.autoAdvance;
		console.log('[PresentationStore] Auto-advance:', this.autoAdvance);

		// If turning on auto-advance and we have a presentation, resume playing
		if (this.autoAdvance && this.currentPresentation && !this.state.isPlaying) {
			this.play();
		}
	}

	// Navigate to next "clear" event (next slide)
	nextSlide() {
		if (!this.currentPresentation) return;

		// Pause auto-advance
		this.pause();

		// Find next clear event
		let nextClearIndex = this.state.currentEventIndex + 1;
		while (
			nextClearIndex < this.currentPresentation.events.length &&
			this.currentPresentation.events[nextClearIndex].type !== 'clear'
		) {
			nextClearIndex++;
		}

		// If found a clear event, jump to it and execute
		if (nextClearIndex < this.currentPresentation.events.length) {
			this.state.currentEventIndex = nextClearIndex;
			this.executeEventRange(nextClearIndex, this.findNextClearOrEnd(nextClearIndex + 1));
		}
	}

	// Navigate to previous "clear" event (previous slide)
	previousSlide() {
		if (!this.currentPresentation) return;

		// Pause auto-advance
		this.pause();

		// Find previous clear event
		let prevClearIndex = this.state.currentEventIndex - 1;
		while (prevClearIndex >= 0 && this.currentPresentation.events[prevClearIndex].type !== 'clear') {
			prevClearIndex--;
		}

		// If found a clear event, jump to it and execute
		if (prevClearIndex >= 0) {
			this.state.currentEventIndex = prevClearIndex;
			this.executeEventRange(prevClearIndex, this.findNextClearOrEnd(prevClearIndex + 1));
		} else {
			// Go to beginning
			this.state.currentEventIndex = 0;
			this.executeEventRange(0, this.findNextClearOrEnd(0));
		}
	}

	// Helper to find next clear event or end
	private findNextClearOrEnd(startIndex: number): number {
		if (!this.currentPresentation) return startIndex;

		for (let i = startIndex; i < this.currentPresentation.events.length; i++) {
			if (this.currentPresentation.events[i].type === 'clear') {
				return i;
			}
		}
		return this.currentPresentation.events.length;
	}

	// Execute a range of events (for slide navigation)
	private async executeEventRange(startIndex: number, endIndex: number) {
		if (!this.currentPresentation) return;

		// Clear screen first
		this.clearScreen();

		// Execute all events in range
		for (let i = startIndex; i < endIndex && i < this.currentPresentation.events.length; i++) {
			const event = this.currentPresentation.events[i];
			await this.executeEvent(event);
		}
	}

	// Get progress percentage
	getProgress(): number {
		if (!this.currentPresentation || this.currentPresentation.events.length === 0) {
			return 0;
		}
		return (this.state.currentEventIndex / this.currentPresentation.events.length) * 100;
	}

	// Get slide count (number of "clear" events)
	getSlideInfo(): { current: number; total: number } {
		if (!this.currentPresentation) {
			return { current: 0, total: 0 };
		}

		const clearEvents = this.currentPresentation.events
			.map((e, i) => ({ event: e, index: i }))
			.filter((x) => x.event.type === 'clear');

		const total = clearEvents.length;
		let current = 0;

		for (let i = 0; i < clearEvents.length; i++) {
			if (clearEvents[i].index <= this.state.currentEventIndex) {
				current = i + 1;
			}
		}

		return { current, total };
	}

	// Debug logging
	addDebugLog(type: DebugLog['type'], data: any) {
		this.debugLogs.push({
			id: `${Date.now()}-${Math.random()}`,
			timestamp: Date.now(),
			type,
			data
		});

		// Keep only last 50 logs to prevent memory issues
		if (this.debugLogs.length > 50) {
			this.debugLogs = this.debugLogs.slice(-50);
		}
	}

	clearDebugLogs() {
		this.debugLogs = [];
	}
}

export const presentationStore = new PresentationStore();
