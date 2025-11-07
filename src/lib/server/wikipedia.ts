/**
 * Wikipedia API integration
 * Fetches article summaries and full content from Wikipedia
 */

export interface WikipediaSearchResult {
	title: string;
	url: string;
	snippet: string;
	pageid: number;
}

export interface WikipediaArticle {
	title: string;
	url: string;
	extract: string; // Summary
	fullContent?: string; // Optional full text
	thumbnail?: {
		source: string;
		width: number;
		height: number;
	};
}

/**
 * Search Wikipedia for articles
 */
export async function searchWikipedia(query: string, limit: number = 5): Promise<WikipediaSearchResult[]> {
	const url = new URL('https://en.wikipedia.org/w/api.php');
	url.searchParams.set('action', 'query');
	url.searchParams.set('list', 'search');
	url.searchParams.set('srsearch', query);
	url.searchParams.set('srlimit', limit.toString());
	url.searchParams.set('format', 'json');
	url.searchParams.set('origin', '*'); // CORS

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`Wikipedia API error: ${response.status}`);
		}

		const data = await response.json();

		if (!data.query?.search) {
			return [];
		}

		return data.query.search.map((result: any) => ({
			title: result.title,
			url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
			snippet: result.snippet.replace(/<[^>]*>/g, ''), // Strip HTML tags
			pageid: result.pageid
		}));
	} catch (error) {
		console.error('[Wikipedia] Search error:', error);
		return [];
	}
}

/**
 * Get a Wikipedia article summary
 */
export async function getWikipediaArticle(title: string): Promise<WikipediaArticle | null> {
	const url = new URL('https://en.wikipedia.org/w/api.php');
	url.searchParams.set('action', 'query');
	url.searchParams.set('prop', 'extracts|pageimages|info');
	url.searchParams.set('exintro', 'true'); // Get intro/summary
	url.searchParams.set('explaintext', 'true'); // Plain text
	url.searchParams.set('titles', title);
	url.searchParams.set('format', 'json');
	url.searchParams.set('inprop', 'url');
	url.searchParams.set('pithumbsize', '500');
	url.searchParams.set('origin', '*'); // CORS

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`Wikipedia API error: ${response.status}`);
		}

		const data = await response.json();
		const pages = data.query?.pages;

		if (!pages) {
			return null;
		}

		const pageId = Object.keys(pages)[0];
		const page = pages[pageId];

		// Check if page exists
		if (page.missing) {
			return null;
		}

		return {
			title: page.title,
			url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
			extract: page.extract || '',
			thumbnail: page.thumbnail ? {
				source: page.thumbnail.source,
				width: page.thumbnail.width,
				height: page.thumbnail.height
			} : undefined
		};
	} catch (error) {
		console.error('[Wikipedia] Article fetch error:', error);
		return null;
	}
}

/**
 * Get full article content (not just summary)
 */
export async function getWikipediaFullContent(title: string): Promise<string | null> {
	const url = new URL('https://en.wikipedia.org/w/api.php');
	url.searchParams.set('action', 'query');
	url.searchParams.set('prop', 'extracts');
	url.searchParams.set('explaintext', 'true'); // Plain text
	url.searchParams.set('titles', title);
	url.searchParams.set('format', 'json');
	url.searchParams.set('origin', '*'); // CORS

	try {
		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`Wikipedia API error: ${response.status}`);
		}

		const data = await response.json();
		const pages = data.query?.pages;

		if (!pages) {
			return null;
		}

		const pageId = Object.keys(pages)[0];
		const page = pages[pageId];

		if (page.missing) {
			return null;
		}

		return page.extract || null;
	} catch (error) {
		console.error('[Wikipedia] Full content fetch error:', error);
		return null;
	}
}
