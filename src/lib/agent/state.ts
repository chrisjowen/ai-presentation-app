/**
 * Agent State Management
 * Tracks conversation history and presentation state
 */

import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import type { BaseMessage } from '@langchain/core/messages';
import type { Component } from '$lib/types/components';
import type { TimelineEvent } from '$lib/types/timeline';

export const AgentState = Annotation.Root({
	// Conversation messages
	messages: Annotation<BaseMessage[]>({
		reducer: messagesStateReducer,
		default: () => []
	}),

	// Current visible components on screen
	currentComponents: Annotation<Component[]>({
		reducer: (_, newComponents) => newComponents || [],
		default: () => []
	}),

	// Timeline events being constructed
	events: Annotation<TimelineEvent[]>({
		reducer: (existing, newEvents) => [...(existing || []), ...(newEvents || [])],
		default: () => []
	}),

	// Session ID
	sessionId: Annotation<string>({
		reducer: (_, newId) => newId,
		default: () => ''
	})
});

export type AgentStateType = typeof AgentState.State;
