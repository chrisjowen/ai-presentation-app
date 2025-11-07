import { json } from '@sveltejs/kit';
import { setSession } from '$lib/server/sessions';
import type { RequestHandler } from './$types';
import { SimpleAgent } from '$lib/agent/simple-agent';
import { env } from '$env/dynamic/private';

// POST /api/sessions/:sessionId/message - Handle user messages and generate agent response
export const POST: RequestHandler = async ({ params, request }) => {
	const { sessionId } = params;

	try {
		const { message, modelId } = await request.json();

		// Check for API keys
		const anthropicKey = env.ANTHROPIC_API_KEY;
		const openaiKey = env.OPENAI_API_KEY;

		if (!anthropicKey && !openaiKey) {
			console.error('[Agent] No API keys found in environment');
			return json(
				{
					error: 'Server configuration error: No API keys configured'
				},
				{ status: 500 }
			);
		}

		// Create simple agent with model selection
		const agent = new SimpleAgent(anthropicKey || '', openaiKey, modelId);

		// Process message with agent - FAST!
		console.log(`[SimpleAgent] Processing: "${message}"`);
		const startTime = Date.now();

		const presentation = await agent.processMessage(message, sessionId);

		const duration = Date.now() - startTime;
		console.log(`[SimpleAgent] Generated ${presentation.events.length} events in ${duration}ms`);

		// Store the updated presentation
		setSession(sessionId, presentation);

		return json(presentation);
	} catch (error) {
		console.error('[SimpleAgent] Error:', error);
		return json(
			{
				error: 'Failed to process message',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
