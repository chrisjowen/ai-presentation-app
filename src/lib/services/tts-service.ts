/**
 * TTS Service
 * Handles text-to-speech generation using OpenAI API with caching
 */

import type { OpenAIVoice } from '$lib/types/tts';
import { audioCache } from './audio-cache';

export class TTSService {
	private baseUrl = '/api/tts/generate';

	async generateSpeech(text: string, voice: OpenAIVoice, speed: number): Promise<Blob> {
		// Check cache first
		const cached = audioCache.get(text, voice, speed);
		if (cached) {
			console.log('[TTSService] Cache hit for:', text.substring(0, 50));
			return cached;
		}

		console.log('[TTSService] Cache miss, generating audio for:', text.substring(0, 50));

		// Generate new audio
		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text, voice, speed })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'TTS generation failed');
			}

			const audioBlob = await response.blob();

			// Cache the result
			audioCache.set(text, voice, speed, audioBlob);

			return audioBlob;
		} catch (error) {
			console.error('[TTSService] Error generating speech:', error);
			throw error;
		}
	}

	async createAudioElement(blob: Blob): Promise<HTMLAudioElement> {
		const url = URL.createObjectURL(blob);
		const audio = new Audio(url);

		// Clean up object URL when audio is loaded
		audio.addEventListener('loadeddata', () => {
			console.log('[TTSService] Audio loaded successfully');
		});

		return audio;
	}
}

export const ttsService = new TTSService();
