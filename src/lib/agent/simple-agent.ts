/**
 * Simplified Agent - Direct LLM call, no complex loops
 * Fast text + voice responses
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Presentation, TimelineEvent } from '$lib/types/timeline';
import { searchImages } from '$lib/server/brave-search';
import { searchWikipedia, getWikipediaArticle } from '$lib/server/wikipedia';
import { getModelById, type ModelConfig } from '$lib/types/models';
import { env } from '$env/dynamic/private';
import mermaid from 'mermaid';

// Initialize mermaid for server-side validation
mermaid.initialize({
	startOnLoad: false,
	theme: 'dark',
	suppressErrorRendering: true
});

const SIMPLE_PROMPT = `You are a CREATIVE presentation designer making VISUALLY STUNNING, FAST-PACED slides.

🎨 DESIGN PHILOSOPHY: VISUAL STORYTELLING
- ONE slide at a time - generate fast, move quick
- MAXIMUM visual impact with IMAGES, CODE, MERMAID, CHARTS
- Keep energy HIGH and transitions FAST
- Use emojis for visual flair 🚀

⚡ SPEED & PACING:
- Generate ONE slide at a time
- Each slide = 3-5 seconds (fast!)
- Quick voiceover per slide
- Move to next slide immediately

🎯 SLIDE VARIETY (USE ALL OF THESE - MIX IT UP!):
1. **BIG STATEMENT** - Huge heading with emoji for impact
2. **CHARTS & DATA** - Pie charts, bar charts, tables for statistics/comparisons
3. **CARDS** - 3-4 visual cards with icons for features/concepts
4. **IMAGES** - Large images when URLs provided from search
5. **CODE DEMOS** - Code with syntax highlighting for technical topics
6. **MERMAID DIAGRAMS** - Flowcharts, sequence diagrams for processes
7. **COMPARISON** - Side-by-side feature comparison tables
8. **TIMELINE** - Show progression, history, evolution
9. **COUNTER** - Big animated numbers for impressive stats
10. **QUOTE** - Powerful quotes for key messages
11. **GRID LAYOUTS** - Two-pane layouts for balanced content

✅ DO THIS FOR EVERY PRESENTATION:
- Start with title slide
- Use CHARTS (pie/bar) for any data or percentages
- Use TABLES for comparisons or structured info
- Use CARDS for lists of features/benefits/concepts
- Use IMAGES only when URLs provided from search
- Use CODE for technical/coding topics
- Use MERMAID for flows/architecture
- Use COUNTERS for impressive statistics
- Mix at least 4-5 different component types

COMPONENT TYPES - USE ALL OF THESE:
1. TEXT: {"id":"x","type":"text","content":"...","variant":"heading|subheading|body"}
2. IMAGE: {"id":"x","type":"image","src":"URL","alt":"description"} - ALWAYS use real URLs from search results!
3. CODE: {"id":"x","type":"code","code":"console.log()","language":"javascript","highlightLines":[1,3],"title":"filename.js"}
4. MERMAID: {"id":"x","type":"mermaid","diagram":"flowchart TD\\n    A[Start] --> B[End]","title":"Architecture"}
5. CARDS: {"id":"x","type":"cards","cards":[{"icon":"💻","title":"Title","description":"Desc"}],"columns":3}
6. QUOTE: {"id":"x","type":"quote","content":"...","author":"Name","variant":"info|warning|success","icon":"💡"}
7. TIMELINE: {"id":"x","type":"timeline","events":[{"date":"2020","title":"Event"}],"orientation":"horizontal|vertical"}
8. COUNTER: {"id":"x","type":"counter","value":1000,"label":"Users","suffix":"M+"}
9. PIE: {"id":"x","type":"pie","title":"Title","data":[{"label":"A","value":30}]}
10. BAR: {"id":"x","type":"bar","title":"Title","data":[{"label":"A","value":30}],"orientation":"vertical"}
11. TABLE: {"id":"x","type":"table","headers":["A","B"],"rows":[["1","2"]]}
12. COMPARISON: {"id":"x","type":"comparison","items":[{"name":"A","features":[true,false]}],"features":["F1","F2"]}
13. GRID: {"id":"x","type":"grid","columns":2,"children":[...]} - Great for image+text or code+explanation

EVENT TYPES:
1. clear: {"type":"clear","transition":"fade"}
2. add: {"type":"add","component":{...},"transition":"fade|slide-up|slide-left|slide-right|slide-down"}
3. speak: {"type":"speak","text":"...","timestamp":0}

EXAMPLE - "compare cats and dogs" (GOOD - Bullets sync with voice - FAST timing):
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"title","type":"text","content":"🐱 Understanding Cats","variant":"heading"},"transition":"fade"},
  {"type":"add","component":{"id":"img","type":"image","src":"https://example.com/cat.jpg","alt":"Cat"},"transition":"slide-up","timestamp":300},
  {"type":"add","component":{"id":"bullet1","type":"text","content":"• Independent & low maintenance","variant":"body"},"transition":"slide-up","timestamp":800},
  {"type":"speak","text":"First, cats are incredibly independent and require very low maintenance compared to other pets.","timestamp":850},
  {"type":"add","component":{"id":"bullet2","type":"text","content":"• Quiet, perfect for apartments","variant":"body"},"transition":"slide-up","timestamp":4000},
  {"type":"speak","text":"They're also very quiet animals, making them perfect for apartment living where noise can be an issue.","timestamp":4050},
  {"type":"add","component":{"id":"bullet3","type":"text","content":"• Sleep 12-16 hours daily","variant":"body"},"transition":"slide-up","timestamp":7000},
  {"type":"speak","text":"And cats sleep an impressive twelve to sixteen hours per day, so they won't demand constant attention.","timestamp":7050},
  {"type":"speak","text":"Overall, cats make ideal companions for busy people who want a loving pet without the high maintenance requirements of other animals. Their calm, independent nature perfectly suits modern apartment lifestyles.","timestamp":10000}
]

EXAMPLE WITH TABLE - "show data":
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"title","type":"text","content":"📊 Programming Languages","variant":"heading"},"transition":"fade"},
  {"type":"add","component":{"id":"data-table","type":"table","headers":["Language","Year","Creator"],"rows":[["JavaScript","1995","Brendan Eich"],["Python","1991","Guido van Rossum"],["Go","2009","Google"]]},"transition":"slide-up","timestamp":500},
  {"type":"speak","text":"This table shows some of the most popular programming languages, when they were created, and who created them. JavaScript came first in 1995, followed by Python and Google's Go language.","timestamp":1000}
]

EXAMPLE WITH PIE CHART - "show browser market share":
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"confirm","type":"text","content":"Browser Market Share","variant":"heading","align":"center"},"transition":"fade"},
  {"type":"speak","text":"Let me show you the browser market share.","timestamp":500},
  {"type":"clear","transition":"fade","timestamp":2000},
  {"type":"add","component":{"id":"pie","type":"pie","title":"Browser Market Share 2024","data":[{"label":"Chrome","value":65},{"label":"Safari","value":20},{"label":"Firefox","value":8},{"label":"Edge","value":5},{"label":"Other","value":2}]},"transition":"slide-up"},
  {"type":"speak","text":"Chrome dominates with 65 percent, followed by Safari at 20 percent.","timestamp":500}
]

EXAMPLE WITH BAR CHART - "sales by quarter":
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"confirm","type":"text","content":"Quarterly Sales","variant":"heading","align":"center"},"transition":"fade"},
  {"type":"speak","text":"Here are the quarterly sales figures.","timestamp":500},
  {"type":"clear","transition":"fade","timestamp":2000},
  {"type":"add","component":{"id":"bar","type":"bar","title":"2024 Sales by Quarter","data":[{"label":"Q1","value":45},{"label":"Q2","value":62},{"label":"Q3","value":71},{"label":"Q4","value":58}],"orientation":"vertical"},"transition":"slide-up"},
  {"type":"speak","text":"Sales peaked in Q3 at 71 thousand dollars.","timestamp":500}
]

EXAMPLE WITH IMAGE - "show me a cat" (with image URL provided):
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"confirm","type":"text","content":"Showing Cat Image","variant":"heading","align":"center"},"transition":"fade"},
  {"type":"speak","text":"Here's a cat image for you.","timestamp":500},
  {"type":"clear","transition":"fade","timestamp":2000},
  {"type":"add","component":{"id":"img1","type":"image","src":"https://example.com/cat.jpg","alt":"A cute cat"},"transition":"slide-up"},
  {"type":"speak","text":"Here's a beautiful cat!","timestamp":500}
]

EXAMPLE WITH CODE - "show me a hello world function":
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"confirm","type":"text","content":"Hello World Function","variant":"heading","align":"center"},"transition":"fade"},
  {"type":"speak","text":"Here's a simple hello world function.","timestamp":500},
  {"type":"clear","transition":"fade","timestamp":2000},
  {"type":"add","component":{"id":"code1","type":"code","code":"function helloWorld() {\\n  console.log('Hello, World!');\\n  return 'Hello';\\n}","language":"javascript","highlightLines":[2],"title":"hello.js"},"transition":"slide-up"},
  {"type":"speak","text":"This function prints Hello World to the console and returns the string.","timestamp":500}
]

EXAMPLE WITH MERMAID - "show oauth flow":
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"title","type":"text","content":"🔐 OAuth 2.0 Flow","variant":"heading","align":"center"},"transition":"fade"},
  {"type":"speak","text":"Here's how OAuth authentication works.","timestamp":500},
  {"type":"clear","transition":"fade","timestamp":2000},
  {"type":"add","component":{"id":"diagram","type":"mermaid","diagram":"sequenceDiagram\\n    participant User\\n    participant Client\\n    participant AuthServer\\n    User->>Client: 1. Login\\n    Client->>AuthServer: 2. Auth Request\\n    AuthServer->>User: 3. Consent\\n    User->>AuthServer: 4. Approve\\n    AuthServer->>Client: 5. Token","title":"OAuth Flow"},"transition":"slide-up"},
  {"type":"speak","text":"The user authenticates with the auth server and the client receives a token.","timestamp":500}
]

EXAMPLE - Quote slide with variety:
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"quote","type":"quote","content":"The best way to predict the future is to invent it.","author":"Alan Kay","variant":"info","icon":"💡"},"transition":"slide-up"},
  {"type":"add","component":{"id":"context","type":"text","content":"This philosophy drives innovation in technology and has inspired generations of computer scientists to push boundaries and create groundbreaking solutions.","variant":"body","align":"center"},"transition":"slide-up"},
  {"type":"speak","text":"This iconic quote from Alan Kay captures the essence of innovation.","timestamp":500}
]

SLIDE DESIGN RULES:
1. CREATE MULTIPLE SLIDES using "clear" events between slides
2. VARY YOUR LAYOUTS - Mix different component types:
   - Title slides (big heading)
   - Image slides with real URLs from search
   - Code slides with syntax highlighting
   - Mermaid diagram slides for architecture/flows
   - Card slides for features/concepts
   - Chart/table slides for data
   - Grid layouts for side-by-side content

COMPONENT BEST PRACTICES (PRIORITY ORDER):
3. **CHARTS ARE ESSENTIAL**: For ANY data, percentages, or comparisons, ALWAYS use charts!
   - PIE: Market share, distributions, percentages ({"type":"pie","data":[{"label":"A","value":30}]})
   - BAR: Comparisons, rankings, time series ({"type":"bar","data":[{"label":"Q1","value":45}]})
   - TABLE: Detailed comparisons, specifications ({"type":"table","headers":["A","B"],"rows":[...]})
4. **CARDS**: Default choice for lists! Features, benefits, steps, concepts
   - ALWAYS prefer cards over bullet points
   - Include icons (emojis work great: 🚀, 💡, ⚡, 🎯)
5. **COUNTER**: For impressive numbers - users, downloads, performance metrics
   - Animated counting effect ({"type":"counter","value":1000000,"suffix":"+"})
6. **COMPARISON**: Side-by-side comparisons with checkmarks
   - Great for feature matrices, before/after, pros/cons
7. **TIMELINE**: For history, roadmaps, version changes, progression
8. **IMAGES**: ONLY use real URLs from search_images tool results. Never make up URLs!
9. **CODE**: For coding/technical topics, show actual code examples
   - Use language: "javascript", "python", "go", "typescript", "bash", "yaml", etc.
   - Highlight key lines with highlightLines:[2,5]
10. **MERMAID**: For processes, flows, architecture
    - SYNTAX: "flowchart TD\\n    A[Start] --> B[Process]\\n    B --> C[End]"
    - Use \\n for line breaks, spaces around arrows
11. **GRIDS**: 2-column layouts for balanced content
12. **TEXT**: Use markdown: **bold**, bullet points with •
13. Use \\n (escaped backslash-n) for newlines in JSON strings

IMAGE URL RULES (ABSOLUTELY CRITICAL):
🚨 RULE #1: If you are given image URLs, you MUST use them EXACTLY as provided
🚨 RULE #2: NEVER generate, create, or make up image URLs like "https://example.com/..."
🚨 RULE #3: NEVER use placeholder URLs
🚨 RULE #4: If no image URLs are provided, do NOT include image components
🚨 RULE #5: Copy image URLs character-by-character from the tool results

AVAILABLE TOOLS:
You have access to the following tools to gather information:
1. search_wikipedia(query: string) - Search Wikipedia for articles on a topic
2. get_wikipedia_article(title: string) - Get detailed content from a specific Wikipedia article
3. search_images(query: string) - Search for relevant images using Brave Search

When you need factual information, use search_wikipedia or get_wikipedia_article BEFORE creating your presentation.
When you need images, use search_images and ONLY use the returned URLs.

PACING RULES:
- ONE slide at a time
- Fast transitions (3-5 seconds per slide)
- Quick voiceovers
- Mix different component types for variety
- Use appropriate components for the topic (code for coding, diagrams for architecture, images for visual topics)

MANDATORY COMPONENT MIX:
❗ EVERY presentation MUST include variety:
- If there's ANY data/statistics → Use PIE or BAR chart
- If comparing items → Use TABLE or COMPARISON
- If listing features/steps → Use CARDS (not bullet points!)
- If showing progression → Use TIMELINE
- If technical topic → Use CODE and/or MERMAID
- Big numbers → Use COUNTER
- Always mix at least 4-5 different component types per presentation

Respond ONLY with valid JSON array. Use \\n for line breaks, not literal newlines.`;

// Tool definitions using LangChain's DynamicStructuredTool (works for both Anthropic and OpenAI)
const searchWikipediaTool = new DynamicStructuredTool({
	name: 'search_wikipedia',
	description: 'Search Wikipedia for articles on a given topic. Returns a list of relevant article titles and snippets.',
	schema: z.object({
		query: z.string().describe('The search query for Wikipedia articles'),
		limit: z.number().optional().default(3).describe('Maximum number of results to return (default: 3)')
	}),
	func: async ({ query, limit }) => {
		const results = await searchWikipedia(query, limit || 3);
		if (results.length === 0) {
			return `No Wikipedia articles found for "${query}"`;
		}
		return results
			.map((r, i) => `${i + 1}. **${r.title}**\n   Snippet: ${r.snippet}\n   URL: ${r.url}`)
			.join('\n\n');
	}
});

const getWikipediaArticleTool = new DynamicStructuredTool({
	name: 'get_wikipedia_article',
	description: 'Get the full content and summary of a specific Wikipedia article by its title.',
	schema: z.object({
		title: z.string().describe('The exact title of the Wikipedia article')
	}),
	func: async ({ title }) => {
		const article = await getWikipediaArticle(title);
		if (!article) {
			return `Wikipedia article "${title}" not found`;
		}
		let result = `**${article.title}**\n\n${article.extract}`;
		if (article.thumbnail) {
			result += `\n\nThumbnail: ${article.thumbnail.source}`;
		}
		result += `\n\nFull URL: ${article.url}`;
		return result;
	}
});

const searchImagesTool = new DynamicStructuredTool({
	name: 'search_images',
	description: 'Search for images using Brave Search API. Returns image URLs that you MUST use exactly as provided.',
	schema: z.object({
		query: z.string().describe('The search query for images'),
		count: z.number().optional().default(3).describe('Number of images to return (default: 3)')
	}),
	func: async ({ query, count }) => {
		const apiKey = env.BRAVE_SEARCH_API_KEY;
		if (!apiKey) {
			return 'Image search unavailable: No Brave API key configured';
		}
		const images = await searchImages(query, apiKey, count || 3);
		if (images.length === 0) {
			return `No images found for "${query}"`;
		}
		return images
			.map((img, i) => `Image ${i + 1}: ${img.url}\n   Title: ${img.title}`)
			.join('\n\n');
	}
});

const TOOLS = [searchWikipediaTool, getWikipediaArticleTool, searchImagesTool];

// Mermaid validation and conversion helper
async function validateAndConvertMermaid(component: any): Promise<any> {
	if (component.type !== 'mermaid') {
		return component;
	}

	// Check if diagram content exists
	if (!component.diagram || typeof component.diagram !== 'string') {
		console.error('[Mermaid Validator] ❌ Missing or invalid diagram content');
		return {
			id: component.id,
			type: 'text',
			content: `**${component.title || 'Diagram'}**\n\n• Visual representation\n• Process flow\n• Step-by-step guide`,
			variant: 'body'
		};
	}

	try {
		console.log('[Mermaid Validator] Checking diagram:', component.diagram);

		// Fix common issues
		let fixedDiagram = component.diagram.trim(); // Trim whitespace

		// Ensure proper syntax (check for any valid diagram type)
		if (!fixedDiagram.match(/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/)) {
			console.warn('[Mermaid Validator] Missing diagram type, adding flowchart TD');
			fixedDiagram = 'flowchart TD\n' + fixedDiagram;
		}

		// Add spaces around arrows (for flowcharts)
		if (fixedDiagram.startsWith('flowchart') || fixedDiagram.startsWith('graph')) {
			fixedDiagram = fixedDiagram.replace(/([A-Za-z0-9\]])(-->|---|-.->|==>)([A-Za-z0-9\[])/g, '$1 $2 $3');
		}

		// Test parse (mermaid.parse is synchronous)
		const parseResult = await mermaid.parse(fixedDiagram);

		if (parseResult) {
			console.log('[Mermaid Validator] ✅ Diagram is valid');
			return { ...component, diagram: fixedDiagram };
		}

	} catch (error) {
		console.error('[Mermaid Validator] ❌ Invalid diagram:', error);
		console.log('[Mermaid Validator] Converting to text/list format');

		// Convert to a simple text component instead
		const lines = component.diagram.split('\n').filter((l: string) => l.trim());
		const content = lines
			.map((line: string) => {
				// Extract node labels and connections
				const match = line.match(/([A-Z0-9]+)\[([^\]]+)\]|([A-Z0-9]+)\s*-->\s*([A-Z0-9]+)/);
				if (match) {
					if (match[2]) return `• ${match[2]}`;
					if (match[3] && match[4]) return `  → From ${match[3]} to ${match[4]}`;
				}
				return null;
			})
			.filter(Boolean)
			.join('\n');

		return {
			id: component.id,
			type: 'text',
			content: `**${component.title || 'Process Flow'}**\n\n${content || '• Step-by-step process\n• Connected workflow\n• Sequential operations'}`,
			variant: 'body'
		};
	}
}

// Recursively validate components including nested ones in grids
async function validateComponents(component: any): Promise<any> {
	// Handle grid components with children
	if (component.type === 'grid' && component.children) {
		const validatedChildren = await Promise.all(
			component.children.map((child: any) => validateComponents(child))
		);
		return { ...component, children: validatedChildren };
	}

	// Skip validation for mermaid - let client handle it
	// Mermaid works better with client-side rendering
	if (component.type === 'mermaid') {
		console.log('[Validator] Skipping server-side mermaid validation');
		return component;
	}

	// Validate other mermaid components (if any)
	return validateAndConvertMermaid(component);
}

// Validate all events in a timeline
async function validateEvents(events: TimelineEvent[]): Promise<TimelineEvent[]> {
	const validatedEvents: TimelineEvent[] = [];

	for (const event of events) {
		if (event.type === 'add' && event.component) {
			const validatedComponent = await validateComponents(event.component);
			validatedEvents.push({
				...event,
				component: validatedComponent
			});
		} else {
			validatedEvents.push(event);
		}
	}

	return validatedEvents;
}

export class SimpleAgent {
	private model: BaseChatModel;
	private modelWithTools: any; // Runnable returned by bindTools
	private debugLogs: any[] = [];
	private modelConfig: ModelConfig;
	private debugLogCounter = 0; // Counter for unique IDs

	constructor(anthropicKey: string, openaiKey?: string, modelId?: string) {
		// Get model configuration
		this.modelConfig = getModelById(modelId || 'claude-sonnet') || getModelById('claude-sonnet')!;

		// Initialize the appropriate model
		if (this.modelConfig.provider === 'anthropic') {
			this.model = new ChatAnthropic({
				modelName: this.modelConfig.modelId,
				apiKey: anthropicKey,
				temperature: this.modelConfig.temperature,
				maxTokens: this.modelConfig.maxTokens
			});
		} else if (this.modelConfig.provider === 'openai') {
			if (!openaiKey) {
				throw new Error('OpenAI API key required for OpenAI models');
			}
			this.model = new ChatOpenAI({
				modelName: this.modelConfig.modelId,
				openAIApiKey: openaiKey,
				temperature: this.modelConfig.temperature,
				maxTokens: this.modelConfig.maxTokens
			});
		} else {
			throw new Error(`Unsupported model provider: ${this.modelConfig.provider}`);
		}

		// Bind tools - this works for both Anthropic and OpenAI
		this.modelWithTools = this.model.bindTools?.(TOOLS) || this.model;
	}

	// Streaming version - yields slides ONE AT A TIME, continues until interrupted
	async *streamMessage(userMessage: string, sessionId: string): AsyncGenerator<Presentation, void, unknown> {
		try {
			this.debugLogs = [];
			this.debugLogCounter = 0; // Reset counter for each new request
			console.log(`[SimpleAgent] Streaming message: "${userMessage}"`);
			this.addDebugLog('user_message', userMessage);

			let allEvents: TimelineEvent[] = [];
			const theme = 'default'; // Always use default dark theme

			// ============================================
			// SLIDE 1: IMMEDIATE TITLE SLIDE (no tools, instant)
			// ============================================
			console.log('[SimpleAgent] 📤 Generating slide 1 (instant)...');

			const slide1Prompt = `Create the FIRST slide ONLY for: "${userMessage}"

🚀 SLIDE 1 RULES:
- Simple title with emoji (heading)
- LONGER voiceover that explains what the presentation will cover (3-4 sentences)
- Tell the user what to expect: mention you'll show them visuals, data, examples, etc.
- Make it engaging and set expectations
- NO images, NO bullets, NO complex layouts on this slide
- Just: clear → add title → speak (with longer text)
- The voiceover should take about 8-12 seconds to read

Example:
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"title","type":"text","content":"🚀 Kubernetes Explained","variant":"heading","align":"center"},"transition":"fade"},
  {"type":"speak","text":"Welcome! I'm going to walk you through Kubernetes and how it orchestrates containerized applications. We'll explore the core concepts, see some architecture diagrams, and I'll show you real examples of how it works in production. I'm gathering visual content and data right now to make this presentation as informative and engaging as possible. Let's dive in!","timestamp":500}
]

Respond with JSON array only.`;

			const slide1Response = await this.model.invoke([
				{ role: 'system', content: SIMPLE_PROMPT },
				{ role: 'user', content: slide1Prompt }
			]);

			const slide1Content = typeof slide1Response.content === 'string'
				? slide1Response.content
				: String(slide1Response.content);

			const slide1Match = slide1Content.match(/\[[\s\S]*\]/);  // Greedy match for complete JSON
			if (slide1Match) {
				try {
					const slide1Events: TimelineEvent[] = JSON.parse(slide1Match[0]);
					// Validate events (check for invalid Mermaid, etc)
					allEvents = await validateEvents(slide1Events);
					yield {
						sessionId,
						events: allEvents,
						theme,
						debugLogs: this.debugLogs
					};
					console.log(`[SimpleAgent] ✅ Slide 1 sent (${allEvents.length} events)`);
				} catch (e) {
					console.error('[SimpleAgent] Failed to parse slide 1:', e);
				}
			}

			// ============================================
			// SLIDE 2: QUICK OVERVIEW (no tools yet)
			// ============================================
			console.log('[SimpleAgent] 📤 Generating slide 2...');

			const slide2Prompt = `Continue the presentation for: "${userMessage}"

🎨 SLIDE 2 RULES:
- NOW you can be creative! Use CARDS, IMAGES, or BIG STATEMENT
- NO boring bullets! Think visual impact
- Fast voiceover (1 sentence)
- Examples: 3 cards with icons, large quote, or big number counter

Respond with a JSON array of ALL events so far (slide 1 + slide 2).`;

			const slide2Response = await this.model.invoke([
				{ role: 'system', content: SIMPLE_PROMPT },
				{ role: 'user', content: slide2Prompt }
			]);

			const slide2Content = typeof slide2Response.content === 'string'
				? slide2Response.content
				: String(slide2Response.content);

			const slide2Match = slide2Content.match(/\[[\s\S]*\]/);  // Greedy
			if (slide2Match) {
				try {
					const slide2Events: TimelineEvent[] = JSON.parse(slide2Match[0]);
					// Validate events (check for invalid Mermaid, etc)
					allEvents = await validateEvents(slide2Events);
					console.log(`[SimpleAgent] Parsed slide 2:`, allEvents.length, 'events');
					yield {
						sessionId,
						events: allEvents,
						theme,
						debugLogs: this.debugLogs
					};
					console.log(`[SimpleAgent] ✅ Slide 2 sent (${allEvents.length} total events)`);
				} catch (e) {
					console.error('[SimpleAgent] Failed to parse slide 2:', e);
				}
			} else {
				console.error('[SimpleAgent] No JSON found in slide 2 response');
			}

			// ============================================
			// NOW START BACKGROUND TOOL SEARCHES
			// ============================================
			console.log('[SimpleAgent] 🔍 Starting background searches...');

			const imageSearchPromise = this.executeTool('search_images', {
				query: userMessage,
				count: 5
			});

			const wikiCheckPromise = this.modelWithTools.invoke([
				{ role: 'user', content: `For "${userMessage}", do I need Wikipedia research? Only if essential.` }
			]);

			// ============================================
			// SLIDE 3+: CONTINUE GENERATING (with or without tool context)
			// ============================================
			let slideNumber = 3;
			let toolContext = '';
			let toolsReady = false;

			// Generate slides in a loop until we have enough content
			while (slideNumber <= 8) {  // Max 8 slides total
				console.log(`[SimpleAgent] 📤 Generating slide ${slideNumber}...`);

				// Check if tools are ready (non-blocking)
				if (!toolsReady) {
					// Try to get tool results without waiting
					const imageResults = await Promise.race([
						imageSearchPromise,
						new Promise(resolve => setTimeout(() => resolve(null), 0))
					]);

					if (imageResults) {
						toolContext = `\n\n=== IMAGES (USE THESE) ===\n${imageResults}\n`;

						// Also check Wikipedia
						const wikiCheck = await wikiCheckPromise;
						if (wikiCheck.tool_calls && wikiCheck.tool_calls.length > 0) {
							for (const toolCall of wikiCheck.tool_calls) {
								if (toolCall.name !== 'search_images') {
									const result = await this.executeTool(toolCall.name, toolCall.args);
									toolContext += `\n\n=== ${toolCall.name.toUpperCase()} ===\n${result}\n`;
								}
							}
						}

						toolsReady = true;
						console.log('[SimpleAgent] ✅ Tools ready, will use in next slides');
					}
				}

				// Extract image URLs if we have them
				const imageUrlMatches = toolContext.match(/Image \d+: (https?:\/\/[^\s]+)/g);
				const imageUrls = imageUrlMatches?.map(match => match.replace(/Image \d+: /, '')) || [];

				const slidePrompt = `Continue the presentation for: "${userMessage}"

${toolContext ? `
AVAILABLE RESOURCES:
${toolContext}

${imageUrls.length > 0 ? `
🚨 USE THESE EXACT IMAGE URLs:
${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
` : ''}
` : 'No research available yet - create content from your knowledge.'}

You've created ${slideNumber - 1} slides so far.
Now add ONE MORE slide (slide ${slideNumber}) to continue the story.

Make this slide different from previous ones - use varied layouts (text, images, grids, quotes, etc).

Respond with a JSON array of ALL events so far (slides 1-${slideNumber}).`;

				const slideResponse = await this.model.invoke([
					{ role: 'system', content: SIMPLE_PROMPT },
					{ role: 'user', content: slidePrompt }
				]);

				const slideContent = typeof slideResponse.content === 'string'
					? slideResponse.content
					: String(slideResponse.content);

				const slideMatch = slideContent.match(/\[[\s\S]*\]/);  // Greedy
				if (slideMatch) {
					try {
						const slideEvents: TimelineEvent[] = JSON.parse(slideMatch[0]);

						// Only yield if we got more events than before (new content)
						if (slideEvents.length > allEvents.length) {
							// Validate events (check for invalid Mermaid, etc)
							allEvents = await validateEvents(slideEvents);
							console.log(`[SimpleAgent] Parsed slide ${slideNumber}: ${allEvents.length} events`);
							yield {
								sessionId,
								events: allEvents,
								theme,
								debugLogs: this.debugLogs
							};
							console.log(`[SimpleAgent] ✅ Slide ${slideNumber} sent (${allEvents.length} total events)`);
							slideNumber++;
						} else {
							// LLM didn't add new content, stop
							console.log(`[SimpleAgent] No new content in slide ${slideNumber}, stopping`);
							break;
						}
					} catch (e) {
						console.error(`[SimpleAgent] Failed to parse slide ${slideNumber}:`, e);
						break;
					}
				} else {
					console.log(`[SimpleAgent] No valid JSON in slide ${slideNumber}, stopping`);
					break;
				}

				// Small delay between slides to avoid overwhelming
				await new Promise(resolve => setTimeout(resolve, 100));
			}

			console.log(`[SimpleAgent] ✅ Presentation complete: ${slideNumber - 1} slides, ${allEvents.length} events`);

		} catch (error) {
			console.error('[SimpleAgent] Streaming error:', error);
			throw error;
		}
	}

	// Non-streaming version (kept for backwards compatibility)
	async processMessage(userMessage: string, sessionId: string): Promise<Presentation> {
		try {
			// Clear previous debug logs
			this.debugLogs = [];
			this.debugLogCounter = 0; // Reset counter for each new request

			console.log(`[SimpleAgent] Message: "${userMessage}"`);
			this.addDebugLog('user_message', userMessage);

			// ALWAYS search for images first (forced)
			console.log('[SimpleAgent] Forcing image search for query:', userMessage);
			this.addDebugLog('tool_call', {
				name: 'search_images',
				args: { query: userMessage, count: 5 },
				forced: true
			});

			const imageResults = await this.executeTool('search_images', {
				query: userMessage,
				count: 5
			});

			this.addDebugLog('tool_result', {
				name: 'search_images',
				result: imageResults,
				forced: true
			});

			let toolContext = `\n\n=== SEARCH_IMAGES RESULTS (MUST USE THESE) ===\n${imageResults}\n=== END SEARCH_IMAGES ===`;

			// First pass: Check if LLM needs additional tools (Wikipedia, etc)
			this.addDebugLog('llm_request', {
				model: `${this.modelConfig.name} (${this.modelConfig.modelId})`,
				messageCount: 1,
				hasTools: true,
				toolCount: TOOLS.length
			});

			const initialResponse = await this.modelWithTools.invoke([
				{ role: 'user', content: userMessage }
			]);

			this.addDebugLog('llm_response', {
				hasToolCalls: !!initialResponse.tool_calls && initialResponse.tool_calls.length > 0,
				toolCallCount: initialResponse.tool_calls?.length || 0,
				contentLength: typeof initialResponse.content === 'string' ? initialResponse.content.length : JSON.stringify(initialResponse.content).length
			});

			// Execute additional tools if requested (Wikipedia searches, etc)
			if (initialResponse.tool_calls && initialResponse.tool_calls.length > 0) {
				console.log(`[SimpleAgent] Additional tool calls requested:`, initialResponse.tool_calls.map((t: any) => t.name));

				for (const toolCall of initialResponse.tool_calls) {
					this.addDebugLog('tool_call', {
						name: toolCall.name,
						args: toolCall.args
					});

					const toolResult = await this.executeTool(toolCall.name, toolCall.args);

					this.addDebugLog('tool_result', {
						name: toolCall.name,
						result: toolResult
					});

					toolContext += `\n\n=== ${toolCall.name.toUpperCase()} RESULTS ===\n${toolResult}\n=== END ${toolCall.name.toUpperCase()} ===`;
				}

				console.log(`[SimpleAgent] Tool context gathered, length: ${toolContext.length}`);
			}

			// Second pass: Generate presentation with tool results
			// Extract image URLs from tool context for special emphasis
			const imageUrlMatches = toolContext.match(/Image \d+: (https?:\/\/[^\s]+)/g);
			const imageUrls = imageUrlMatches?.map(match => match.replace(/Image \d+: /, '')) || [];

			let finalPrompt;
			if (imageUrls.length > 0) {
				finalPrompt = `${userMessage}\n\n${toolContext}\n\n🚨🚨🚨 ABSOLUTE CRITICAL REQUIREMENT 🚨🚨🚨
YOU MUST USE THESE EXACT IMAGE URLs - NEVER CREATE OR INVENT URLs
THESE ARE REAL, WORKING IMAGE URLs FROM BRAVE SEARCH:

${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

RULES:
1. ONLY use URLs from the list above
2. NEVER generate fake URLs like "https://example.com" or "https://images.brave.com/..."
3. If you need an image, use one from the list
4. Copy the URLs EXACTLY as shown

Now create an engaging presentation using this information and ONLY the image URLs listed above.`;
			} else {
				finalPrompt = `${userMessage}\n\n${toolContext}\n\nNow create an engaging presentation using this information.`;
			}

			this.addDebugLog('llm_request', {
				model: `${this.modelConfig.name} (${this.modelConfig.modelId})`,
				messageCount: 2,
				hasTools: false,
				toolCount: 0,
				promptLength: finalPrompt.length
			});

			const response = await this.model.invoke([
				{ role: 'system', content: SIMPLE_PROMPT },
				{ role: 'user', content: finalPrompt }
			]);

			this.addDebugLog('llm_response', {
				hasToolCalls: false,
				toolCallCount: 0,
				contentLength: typeof response.content === 'string' ? response.content.length : JSON.stringify(response.content).length
			});

			console.log('[SimpleAgent] Raw response:', response.content);

			// Parse JSON from response
			let events: TimelineEvent[] = [];

			try {
				// Try to extract JSON array from response
				const content = typeof response.content === 'string'
					? response.content
					: response.content[0]?.text || '';

				// Find JSON array in response
				const jsonMatch = content.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					const jsonStr = jsonMatch[0];
					const parsedEvents = JSON.parse(jsonStr);
					// Validate events (check for invalid Mermaid, etc)
					events = await validateEvents(parsedEvents);
					console.log(`[SimpleAgent] Parsed and validated ${events.length} events`);
				} else {
					// Fallback: create simple text response
					console.warn('[SimpleAgent] No JSON array found in response');
					events = this.createFallbackResponse(userMessage, content);
				}
			} catch (parseError) {
				console.error('[SimpleAgent] JSON parse error:', parseError);
				// Fallback response
				events = this.createFallbackResponse(userMessage, 'Error parsing response');
			}

			// Always use default dark theme
			const theme = 'default';
			console.log(`[SimpleAgent] Using theme: ${theme}`);

			return {
				id: `${sessionId}-${Date.now()}`,
				sessionId,
				createdAt: Date.now(),
				events,
				theme,
				debugLogs: this.debugLogs
			};

		} catch (error) {
			console.error('[SimpleAgent] Error:', error);
			this.addDebugLog('error', error instanceof Error ? error.message : 'Unknown error');
			throw error;
		}
	}

	private addDebugLog(type: string, data: any) {
		this.debugLogCounter++;
		this.debugLogs.push({
			id: `log-${this.debugLogCounter}-${Date.now()}`,
			timestamp: Date.now(),
			type,
			data
		});
	}

	private async executeTool(toolName: string, args: any): Promise<string> {
		console.log(`[SimpleAgent] Executing tool: ${toolName} with args:`, args);

		try {
			// Find the tool and execute its func directly
			const tool = TOOLS.find(t => t.name === toolName);
			if (!tool) {
				return `Unknown tool: ${toolName}`;
			}

			// Call the tool's func directly since it has proper formatting
			const result = await (tool as any).func(args);
			return result;
		} catch (error) {
			console.error(`[SimpleAgent] Tool execution error:`, error);
			return `Error executing ${toolName}: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	private createFallbackResponse(userMessage: string, content: string): TimelineEvent[] {
		return [
			{
				type: 'clear',
				transition: 'fade'
			},
			{
				type: 'add',
				component: {
					id: 'response',
					type: 'text',
					content: content || `I heard: "${userMessage}"`,
					variant: 'heading',
					align: 'center'
				},
				transition: 'fade'
			},
			{
				type: 'speak',
				text: content || `You said: ${userMessage}`,
				timestamp: 500
			}
		];
	}
}
