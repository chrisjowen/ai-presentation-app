/**
 * Chat API endpoint - uses SimpleAgent for single-slide responses
 */

import { json } from '@sveltejs/kit';
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from '$env/static/private';
import { SimpleAgent } from '$lib/agent/simple-agent.js';
import type { RequestHandler } from './$types';

/**
 * POST /api/chat - Send a chat message and get a single-slide presentation
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

		// Use SimpleAgent to generate a single-slide presentation
		const agent = new SimpleAgent(ANTHROPIC_API_KEY, OPENAI_API_KEY, 'claude-haiku');
		
		// Get the first (and only) slide from the stream
		let presentation = null;
		for await (const pres of agent.streamMessage(message, sessionId)) {
			presentation = pres;
			break; // Only take the first slide
		}

		if (!presentation) {
			return json(
				{ error: 'Failed to generate response' },
				{ status: 500 }
			);
		}

		return json({
			success: true,
			presentation
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


