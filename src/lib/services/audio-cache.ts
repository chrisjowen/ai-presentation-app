/**
 * Audio Cache Service
 * In-memory cache for generated TTS audio to reduce API calls
 */

interface CacheEntry {
	audio: Blob;
	timestamp: number;
}

class AudioCache {
	private cache = new Map<string, CacheEntry>();
	private maxSize = 50; // Maximum number of cached audio files
	private maxAge = 1000 * 60 * 60; // 1 hour

	generateKey(text: string, voice: string, speed: number): string {
		return `${voice}:${speed}:${text.substring(0, 100)}`;
	}

	set(text: string, voice: string, speed: number, audio: Blob): void {
		const key = this.generateKey(text, voice, speed);

		// Evict oldest entry if cache is full
		if (this.cache.size >= this.maxSize) {
			const oldestKey = Array.from(this.cache.entries()).sort(
				(a, b) => a[1].timestamp - b[1].timestamp
			)[0][0];
			this.cache.delete(oldestKey);
		}

		this.cache.set(key, {
			audio,
			timestamp: Date.now()
		});
	}

	get(text: string, voice: string, speed: number): Blob | null {
		const key = this.generateKey(text, voice, speed);
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// Check if entry is expired
		if (Date.now() - entry.timestamp > this.maxAge) {
			this.cache.delete(key);
			return null;
		}

		return entry.audio;
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}
}

export const audioCache = new AudioCache();
