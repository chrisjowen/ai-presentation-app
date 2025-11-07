/**
 * Timeline DSL
 * Defines the structure for orchestrated presentation updates
 */

import type { Component, TransitionType } from './components';

// Event Types
export type TimelineEventType =
	| 'add'        // Add a new component
	| 'update'     // Update an existing component
	| 'remove'     // Remove a component
	| 'clear'      // Clear entire screen
	| 'speak';     // Text-to-speech marker

// Base Timeline Event
export interface BaseTimelineEvent {
	type: TimelineEventType;
	timestamp?: number;  // Delay in ms from previous event (0 = immediate)
	speechMarker?: string; // Word/phrase that triggers this event during TTS
}

// Add Component Event
export interface AddComponentEvent extends BaseTimelineEvent {
	type: 'add';
	component: Component;
	transition?: TransitionType;
}

// Update Component Event
export interface UpdateComponentEvent extends BaseTimelineEvent {
	type: 'update';
	componentId: string;
	updates: Partial<Component>;
	transition?: TransitionType;
}

// Remove Component Event
export interface RemoveComponentEvent extends BaseTimelineEvent {
	type: 'remove';
	componentId: string;
	transition?: TransitionType;
}

// Clear Screen Event
export interface ClearScreenEvent extends BaseTimelineEvent {
	type: 'clear';
	transition?: TransitionType;
}

// Speech Event
export interface SpeechEvent extends BaseTimelineEvent {
	type: 'speak';
	text: string;
	voice?: string;
	rate?: number;   // Speech rate 0.1-10, default 1
	pitch?: number;  // Speech pitch 0-2, default 1
	onWordMarkers?: { word: string; eventIndex: number }[]; // Trigger events at specific words
}

// Union type of all timeline events
export type TimelineEvent =
	| AddComponentEvent
	| UpdateComponentEvent
	| RemoveComponentEvent
	| ClearScreenEvent
	| SpeechEvent;

// Timeline State
export interface PresentationState {
	components: Component[];
	currentEventIndex: number;
	isPlaying: boolean;
	isPaused: boolean;
}

// Full Timeline/Presentation
export interface Presentation {
	id: string;
	sessionId: string;
	events: TimelineEvent[];
	createdAt: number;
	theme?: string; // Theme ID (space, ai, default)
	debugLogs?: any[]; // Debug logs from agent processing
}

// Example presentation structure
export const EXAMPLE_PRESENTATION: Presentation = {
	id: 'demo-1',
	sessionId: 'demo-session',
	createdAt: Date.now(),
	events: [
		{
			type: 'clear',
			transition: 'fade'
		},
		{
			type: 'add',
			component: {
				id: 'title',
				type: 'text',
				content: 'Welcome to AI Presentations',
				variant: 'heading',
				align: 'center'
			},
			transition: 'fade'
		},
		{
			type: 'speak',
			text: 'Welcome to AI Presentations, a new way to interact with AI agents.'
		},
		{
			type: 'add',
			timestamp: 500,
			component: {
				id: 'subtitle',
				type: 'text',
				content: 'The future of AI interaction',
				variant: 'subheading',
				align: 'center'
			},
			transition: 'slide-up'
		},
		{
			type: 'speak',
			timestamp: 200,
			text: 'Instead of scrolling through endless chat messages, you get an immersive presentation experience.'
		},
		{
			type: 'clear',
			timestamp: 400,
			transition: 'fade'
		},
		{
			type: 'add',
			timestamp: 200,
			component: {
				id: 'grid-demo',
				type: 'grid',
				columns: 2,
				gap: 32,
				children: [
					{
						id: 'feature-1',
						type: 'text',
						content: 'Dynamic Components',
						variant: 'heading',
						align: 'center',
						color: '#60a5fa'
					},
					{
						id: 'feature-2',
						type: 'text',
						content: 'Voice Narration',
						variant: 'heading',
						align: 'center',
						color: '#a78bfa'
					}
				]
			},
			transition: 'fade'
		},
		{
			type: 'speak',
			timestamp: 200,
			text: 'Text, images, and grids update dynamically, all synchronized with voice narration.'
		},
		{
			type: 'clear',
			timestamp: 400,
			transition: 'slide-left'
		},
		{
			type: 'add',
			timestamp: 200,
			component: {
				id: 'final-message',
				type: 'text',
				content: 'Press SPACE to pause and ask questions anytime',
				variant: 'subheading',
				align: 'center'
			},
			transition: 'slide-up'
		},
		{
			type: 'speak',
			timestamp: 300,
			text: 'You can press the spacebar at any time to pause and ask questions. Try it now!'
		}
	]
};
