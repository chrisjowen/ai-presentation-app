import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { OpenAIVoice } from '$lib/types/tts';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { text, voice, speed } = await request.json();

		// Validate input
		if (!text || typeof text !== 'string') {
			return json({ error: 'Invalid text parameter' }, { status: 400 });
		}

		const validVoices: OpenAIVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
		if (!voice || !validVoices.includes(voice)) {
			return json({ error: 'Invalid voice parameter' }, { status: 400 });
		}

		const speedNum = parseFloat(speed);
		if (isNaN(speedNum) || speedNum < 0.25 || speedNum > 4.0) {
			return json({ error: 'Invalid speed parameter (must be 0.25-4.0)' }, { status: 400 });
		}

		// Generate speech using OpenAI TTS
		const mp3 = await openai.audio.speech.create({
			model: 'tts-1',
			voice: voice,
			input: text,
			speed: speedNum
		});

		// Convert response to buffer
		const buffer = Buffer.from(await mp3.arrayBuffer());

		// Return audio as response
		return new Response(buffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Content-Length': buffer.length.toString(),
				'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
			}
		});
	} catch (error) {
		console.error('TTS generation error:', error);
		return json(
			{
				error: 'TTS generation failed',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
