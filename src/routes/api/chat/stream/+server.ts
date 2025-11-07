/**
 * Streaming chat API endpoint
 */

import { ANTHROPIC_API_KEY } from '$env/static/private';
import { ChatAgent } from '$lib/agent/chat/ChatAgent.js';
import type { RequestHandler } from './$types';

// Store chat agents per session (shared with main chat endpoint)
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
 * GET /api/chat/stream - Stream chat response
 */
export const GET: RequestHandler = async ({ url }) => {
	const message = url.searchParams.get('message');
	const sessionId = url.searchParams.get('sessionId');

	// Validate input
	if (!message) {
		return new Response('Message is required', { status: 400 });
	}

	if (!sessionId) {
		return new Response('Session ID is required', { status: 400 });
	}

	// Get chat agent for session
	const agent = getChatAgent(sessionId);

	// Create SSE stream
	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			try {
				// Stream response
				for await (const chunk of agent.streamChat(message)) {
					const data = JSON.stringify(chunk);
					controller.enqueue(encoder.encode(`data: ${data}\n\n`));
				}

				// Send done event
				controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
				controller.close();
			} catch (error) {
				console.error('Stream error:', error);
				const errorData = JSON.stringify({
					type: 'error',
					content: error instanceof Error ? error.message : 'Unknown error'
				});
				controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
