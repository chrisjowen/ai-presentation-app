import { setSession } from '$lib/server/sessions';
import type { RequestHandler } from './$types';
import { SimpleAgent } from '$lib/agent/simple-agent';
import { env } from '$env/dynamic/private';

// POST /api/sessions/:sessionId/stream - Stream agent responses using Server-Sent Events
export const POST: RequestHandler = async ({ params, request }) => {
	const { sessionId } = params;

	try {
		const { message, modelId } = await request.json();

		// Check for API keys
		const anthropicKey = env.ANTHROPIC_API_KEY;
		const openaiKey = env.OPENAI_API_KEY;

		if (!anthropicKey && !openaiKey) {
			console.error('[Agent] No API keys found in environment');
			return new Response(
				JSON.stringify({
					error: 'Server configuration error: No API keys configured'
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Create simple agent with model selection
		const agent = new SimpleAgent(anthropicKey || '', openaiKey, modelId);

		console.log(`[SimpleAgent] Streaming: "${message}"`);
		const startTime = Date.now();

		// Create a readable stream for SSE
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					let lastPresentation;

					// Stream updates from agent
					for await (const presentation of agent.streamMessage(message, sessionId)) {
						lastPresentation = presentation;

						// Send update as SSE
						const data = `data: ${JSON.stringify(presentation)}\n\n`;
						controller.enqueue(encoder.encode(data));
					}

					// Store the final presentation
					if (lastPresentation) {
						setSession(sessionId, lastPresentation);
					}

					const duration = Date.now() - startTime;
					console.log(`[SimpleAgent] Streaming completed in ${duration}ms`);

					// Send completion signal
					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();
				} catch (error) {
					console.error('[SimpleAgent] Streaming error:', error);
					const errorData = `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`;
					controller.enqueue(encoder.encode(errorData));
					controller.close();
				}
			}
		});

		// Return SSE response
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});
	} catch (error) {
		console.error('[SimpleAgent] Error:', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to process message',
				details: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
