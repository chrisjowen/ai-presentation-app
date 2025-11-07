/**
 * Chat API endpoint for interactive presentation refinement
 */

import { json } from '@sveltejs/kit';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { ChatAgent } from '$lib/agent/chat/ChatAgent.js';
import type { RequestHandler } from './$types';

// Store chat agents per session (in-memory for now)
const chatAgents = new Map<string, ChatAgent>();

/**
 * Get or create a chat agent for a session
 */
function getChatAgent(sessionId: string): ChatAgent {
	if (!chatAgents.has(sessionId)) {
		const agent = new ChatAgent(ANTHROPIC_API_KEY);
		chatAgents.set(sessionId, agent);
	}
	return chatAgents.get(sessionId)!;
}

/**
 * POST /api/chat - Send a chat message
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message, sessionId } = await request.json();

		// Validate input
		if (!message || typeof message !== 'string') {
			return json(
				{ error: 'Message is required and must be a string' },
				{ status: 400 }
			);
		}

		if (!sessionId || typeof sessionId !== 'string') {
			return json(
				{ error: 'Session ID is required and must be a string' },
				{ status: 400 }
			);
		}

		// Get chat agent for session
		const agent = getChatAgent(sessionId);

		// Get response
		const response = await agent.chat(message);

		return json({
			success: true,
			text: response.text,
			components: response.components,
			conversationId: response.conversationId
		});
	} catch (error) {
		console.error('Chat API error:', error);
		return json(
			{
				error: 'Failed to process chat message',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/chat - Reset conversation for a session
 */
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const sessionId = url.searchParams.get('sessionId');

		if (!sessionId) {
			return json(
				{ error: 'Session ID is required' },
				{ status: 400 }
			);
		}

		// Reset or remove agent
		const agent = chatAgents.get(sessionId);
		if (agent) {
			agent.reset();
		}

		return json({ success: true });
	} catch (error) {
		console.error('Chat reset error:', error);
		return json(
			{
				error: 'Failed to reset conversation',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * GET /api/chat - Get conversation history
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const sessionId = url.searchParams.get('sessionId');

		if (!sessionId) {
			return json(
				{ error: 'Session ID is required' },
				{ status: 400 }
			);
		}

		const agent = chatAgents.get(sessionId);
		if (!agent) {
			return json({
				success: true,
				messages: [],
				components: []
			});
		}

		const history = agent.getHistory();
		const registry = agent.getRegistry();

		return json({
			success: true,
			messages: history.getAllMessages(),
			components: registry.list()
		});
	} catch (error) {
		console.error('Chat history error:', error);
		return json(
			{
				error: 'Failed to get conversation history',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
