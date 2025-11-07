/**
 * Brave Search API Integration
 * For image search functionality
 */

export interface BraveImageResult {
	url: string;
	title: string;
	thumbnail: string;
	source: string;
}

export async function searchImages(
	query: string,
	apiKey: string,
	count: number = 5
): Promise<BraveImageResult[]> {
	if (!apiKey) {
		console.warn('[BraveSearch] No API key provided, returning empty results');
		return [];
	}

	try {
		const url = new URL('https://api.search.brave.com/res/v1/images/search');
		url.searchParams.set('q', query);
		url.searchParams.set('count', count.toString());
		url.searchParams.set('safesearch', 'strict');

		console.log('[BraveSearch] Searching for:', query);

		const response = await fetch(url.toString(), {
			headers: {
				'Accept': 'application/json',
				'Accept-Encoding': 'gzip',
				'X-Subscription-Token': apiKey
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[BraveSearch] API error:', response.status, response.statusText, errorText);
			return [];
		}

		const data = await response.json();
		console.log('[BraveSearch] Raw response:', JSON.stringify(data).substring(0, 500));

		if (!data.results || !Array.isArray(data.results)) {
			console.warn('[BraveSearch] No results found in response');
			return [];
		}

		const results = data.results.slice(0, count).map((result: any) => ({
			url: result.properties?.url || result.url,
			title: result.title || '',
			thumbnail: result.thumbnail?.src || result.properties?.url || result.url,
			source: result.source || ''
		}));

		console.log('[BraveSearch] Returning', results.length, 'results');
		return results;
	} catch (error) {
		console.error('[BraveSearch] Error searching images:', error);
		return [];
	}
}
