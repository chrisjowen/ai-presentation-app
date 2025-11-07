/**
 * Simplified Dynamic Agent - Content-driven presentation generation
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import type { Presentation, TimelineEvent } from '$lib/types/timeline';
import { searchImages } from '$lib/server/brave-search';
import { searchWikipedia } from '$lib/server/wikipedia';
import { getModelById } from '$lib/types/models';
import { env } from '$env/dynamic/private';

const DYNAMIC_PROMPT = `You are a creative presentation designer. Generate engaging, visual presentations that adapt to the content.

🎨 DESIGN PHILOSOPHY:
- Let content drive the design - no rigid formulas
- Use varied, creative layouts
- Mix multiple component types
- Keep it visual and engaging
- Fast pacing with quick transitions

📐 AVAILABLE COMPONENTS:
- text: headings, subheadings, body text, captions
- image: full-bleed images, hero backgrounds
- code: syntax-highlighted code blocks
- mermaid: flowcharts, diagrams (prefer horizontal: "flowchart LR")
- cards: feature grids with icons
- table: data tables (compact styling)
- pie/bar: charts for data
- quote: impactful quotes
- counter: big animated numbers
- timeline: horizontal/vertical timelines
- title-slide: formal title slides
- content-slide: multi-column layouts

🎯 CONTENT-DRIVEN RULES:
- **Data/Stats?** → Use charts, tables, counters
- **Process/Flow?** → Use mermaid diagrams (horizontal!)
- **Features/Benefits?** → Use cards with icons
- **Code/Technical?** → Use code blocks
- **Visual Topic?** → Use images prominently
- **Comparison?** → Use tables or split layouts
- **Story/Quote?** → Use quotes, statements

⚡ TIMING:
- Keep delays short: 200-400ms between elements
- Quick voiceovers: 1-2 sentences per slide
- Fast transitions between slides: 400ms

🖼️ IMAGES:
- ALWAYS use images for visual topics
- Use provided image URLs from search results
- Place images prominently (hero, split, full-bleed)

EVENT TYPES:
1. clear: {"type":"clear","transition":"fade"}
2. add: {"type":"add","component":{...},"transition":"fade|slide-up|slide-left","timestamp":200}
3. speak: {"type":"speak","text":"...","timestamp":200}

EXAMPLE - Technical topic with code + diagram:
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"title","type":"text","content":"React Hooks","variant":"heading"},"transition":"fade"},
  {"type":"speak","text":"Let's explore React Hooks and how they simplify state management."},
  {"type":"add","component":{"id":"code","type":"code","code":"const [count, setCount] = useState(0);","language":"javascript","title":"useState Example"},"transition":"slide-up","timestamp":200},
  {"type":"speak","text":"The useState hook lets you add state to functional components.","timestamp":300},
  {"type":"add","component":{"id":"diagram","type":"mermaid","diagram":"flowchart LR\\n    A[Component] --> B[useState]\\n    B --> C[State]\\n    C --> D[Re-render]"},"transition":"slide-up","timestamp":2000},
  {"type":"speak","text":"Here's how the state flow works in React.","timestamp":2200}
]

EXAMPLE - Visual topic with images:
[
  {"type":"clear","transition":"fade"},
  {"type":"add","component":{"id":"hero","type":"hero","backgroundImage":"https://example.com/paris.jpg","title":"Paris","subtitle":"The City of Light","overlay":"dark"},"transition":"fade"},
  {"type":"speak","text":"Paris, known as the City of Light, is one of the world's most beautiful cities."},
  {"type":"add","component":{"id":"cards","type":"cards","cards":[{"icon":"🗼","title":"Eiffel Tower","description":"Iconic landmark"},{"icon":"🎨","title":"Louvre","description":"World's largest museum"},{"icon":"🥐","title":"Cuisine","description":"French gastronomy"}],"columns":3},"transition":"slide-up","timestamp":400},
  {"type":"speak","text":"From the Eiffel Tower to world-class museums and cuisine, Paris has it all.","timestamp":600}
]

Generate a complete presentation as a JSON array of timeline events.
Be creative, visual, and engaging!`;

export class SimpleDynamicAgent {
	private model: any;
	private apiKey: string;

	constructor(anthropicKey: string, openaiKey: string, modelId: string = 'claude-3-5-sonnet-20241022') {
		this.apiKey = env.BRAVE_SEARCH_API_KEY || '';
		
		const modelConfig = getModelById(modelId);
		if (!modelConfig) {
			throw new Error(`Model ${modelId} not found`);
		}

		if (modelConfig.provider === 'anthropic') {
			this.model = new ChatAnthropic({
				apiKey: anthropicKey,
				modelName: modelConfig.modelId,
				temperature: 0.7,
				maxTokens: 4096
			});
		} else {
			this.model = new ChatOpenAI({
				apiKey: openaiKey,
				model: modelConfig.modelId,
				temperature: 0.7,
				maxTokens: 4096
			});
		}
	}

	async *streamMessage(userMessage: string, sessionId: string): AsyncGenerator<Presentation, void, unknown> {
		try {
			console.log(`[SimpleDynamicAgent] Generating presentation for: "${userMessage}"`);

			// Start searches in parallel
			const imageSearchPromise = searchImages(userMessage, this.apiKey, 5);
			const wikiSearchPromise = searchWikipedia(userMessage);

			// Wait for searches (with timeout)
			const [imageResults, wikiResults] = await Promise.all([
				Promise.race([imageSearchPromise, new Promise(resolve => setTimeout(() => resolve([]), 3000))]),
				Promise.race([wikiSearchPromise, new Promise(resolve => setTimeout(() => resolve([]), 3000))])
			]);

			// Build context
			let context = '';
			if (Array.isArray(imageResults) && imageResults.length > 0) {
				context += '\n\n🖼️ AVAILABLE IMAGES (use these exact URLs):\n';
				imageResults.forEach((img: any, i: number) => {
					context += `${i + 1}. ${img.url} - ${img.title}\n`;
				});
			}

			if (Array.isArray(wikiResults) && wikiResults.length > 0) {
				context += '\n\n📚 WIKIPEDIA CONTEXT:\n';
				wikiResults.slice(0, 2).forEach((result: any) => {
					context += `- ${result.title}: ${result.snippet}\n`;
				});
			}

			// Generate presentation
			const prompt = `Create a presentation for: "${userMessage}"

${context}

Generate a complete, engaging presentation with 5-8 slides.
Use varied layouts and components based on the content.
Respond with ONLY a JSON array of timeline events.`;

			const response = await this.model.invoke([
				{ role: 'system', content: DYNAMIC_PROMPT },
				{ role: 'user', content: prompt }
			]);

			const content = typeof response.content === 'string' ? response.content : String(response.content);
			const jsonMatch = content.match(/\[[\s\S]*\]/);

			if (jsonMatch) {
				const events: TimelineEvent[] = JSON.parse(jsonMatch[0]);
				
				yield {
					id: `pres-${Date.now()}`,
					sessionId,
					events,
					theme: 'default',
					createdAt: Date.now()
				};
			}

		} catch (error) {
			console.error('[SimpleDynamicAgent] Error:', error);
			throw error;
		}
	}
}
