import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { searchImages } from '$lib/server/brave-search';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query, count = 5 } = await request.json();

		if (!query) {
			return json({ error: 'Query is required' }, { status: 400 });
		}

		const apiKey = env.BRAVE_SEARCH_API_KEY;
		if (!apiKey) {
			console.warn('[ImageSearch] No Brave API key configured');
			return json({ results: [] }); // Return empty results instead of error
		}

		const results = await searchImages(query, apiKey, count);

		return json({ results });
	} catch (error) {
		console.error('[ImageSearch] Error:', error);
		return json({ error: 'Failed to search images', results: [] }, { status: 500 });
	}
};
