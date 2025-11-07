/**
 * LangGraph Agent
 * ReAct agent that controls the presentation UI
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { AgentState } from './state';
import { allTools } from './tools';
import type { Component } from '$lib/types/components';
import type { TimelineEvent, Presentation } from '$lib/types/timeline';

const SYSTEM_PROMPT = `You are an AI presentation assistant. Instead of responding with text in a chat, you create immersive visual presentations with synchronized voice narration.

## IMPORTANT: Speed & Confirmation Flow

When a user speaks, respond IMMEDIATELY with 2-3 quick actions:
1. Clear screen (clear_screen)
2. Show confirmation text (add_component with their request)
3. Speak confirmation (speak) - "I'll create a presentation about [topic]"

THEN create the full presentation. Don't overthink - be fast and responsive!

## Your Capabilities

You have access to tools to control a full-screen presentation interface:

1. **add_component**: Add text or images to the screen
2. **update_component**: Modify existing components
3. **remove_component**: Remove components
4. **clear_screen**: Clear everything
5. **speak**: Use text-to-speech narration
6. **search_images**: Search for images by query
7. **get_current_state**: Check what's currently on screen

## How to Create Presentations

### Component Types:
- **text**: Display text with variants (heading, subheading, body, caption)
- **image**: Display images from URLs (use search_images to find them!)

### Transitions (ALWAYS USE THESE!):
- fade, slide-left, slide-right, slide-up, slide-down, instant
- Default should be 'fade' or 'slide-up', NOT 'instant'

### Best Practices:
1. **Respond immediately**: Start with confirmation (2-3 tool calls max)
2. **Always narrate**: Use the speak tool to explain what you're showing
3. **Orchestrate timing**: Use timestamp to sequence events (in milliseconds)
4. **Keep it visual**: Show images whenever possible - use search_images!
5. **Use transitions**: ALWAYS specify transition='fade' or 'slide-up' etc
6. **Center important content**: Use align='center' for key messages
7. **Be concise**: 5-8 tool calls per response is ideal

## Example Fast Response Flow:
User: "Tell me about dogs"

Quick confirmation (3 tool calls):
1. clear_screen({ transition: 'fade' })
2. add_component({ component: { type: 'text', content: 'Dogs', variant: 'heading', align: 'center' }, transition: 'fade' })
3. speak({ text: "I'll create a presentation about dogs!" })

Then build the presentation (5-6 more tool calls):
4. search_images({ query: 'golden retriever dog', timestamp: 1000 })
5. add_component({ component: { type: 'image', ... }, transition: 'slide-up', timestamp: 500 })
6. speak({ text: "Dogs are man's best friend...", timestamp: 1000 })
... etc

Remember: Speed matters! Confirm first, then create. Use transitions! Search for images!`;

export class PresentationAgent {
	private model: ChatAnthropic;
	private agent: any;

	constructor(apiKey?: string) {
		this.model = new ChatAnthropic({
			modelName: 'claude-3-5-sonnet-20241022',
			apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
			temperature: 0.7,
			maxTokens: 4096
		});

		// Create ReAct agent with recursion limit
		this.agent = createReactAgent({
			llm: this.model,
			tools: allTools,
			messageModifier: SYSTEM_PROMPT
		});
	}

	/**
	 * Process a user message and generate presentation updates
	 */
	async processMessage(
		userMessage: string,
		sessionId: string,
		currentComponents: Component[] = [],
		conversationHistory: any[] = []
	): Promise<Presentation> {
		// Build initial state (messageModifier adds system prompt automatically)
		const initialState = {
			messages: [
				...conversationHistory,
				new HumanMessage(userMessage)
			],
			currentComponents,
			events: [],
			sessionId
		};

		// Collect events from tool calls
		const collectedEvents: TimelineEvent[] = [];

		// Run the agent with recursion limit
		const stream = await this.agent.stream(initialState, {
			recursionLimit: 500, // Prevent infinite loops
			configurable: {
				thread_id: sessionId
			}
		});

		// Process stream and collect tool outputs
		for await (const chunk of stream) {
			// Check for tool outputs
			if (chunk.agent?.messages) {
				for (const message of chunk.agent.messages) {
					if (message.tool_calls) {
						for (const toolCall of message.tool_calls) {
							try {
								// Parse the tool output which should be a JSON string of an event
								const toolOutput = toolCall.args;

								// Convert tool call to timeline event
								const event = this.toolCallToEvent(toolCall.name, toolOutput);
								if (event) {
									collectedEvents.push(event);
								}
							} catch (error) {
								console.error('Error parsing tool output:', error);
							}
						}
					}
				}
			}
		}

		// Create presentation from collected events
		const presentation: Presentation = {
			id: `${sessionId}-${Date.now()}`,
			sessionId,
			createdAt: Date.now(),
			events: collectedEvents
		};

		return presentation;
	}

	/**
	 * Convert tool call to timeline event
	 */
	private toolCallToEvent(toolName: string, args: any): TimelineEvent | null {
		
		console.log('Tool call:', toolName, args);
		switch (toolName) {
			case 'add_component':
				return {
					type: 'add',
					component: args.component,
					transition: args.transition || 'instant',
					timestamp: args.timestamp || 0
				};

			case 'update_component':
				return {
					type: 'update',
					componentId: args.componentId,
					updates: args.updates,
					transition: args.transition || 'instant',
					timestamp: args.timestamp || 0
				};

			case 'remove_component':
				return {
					type: 'remove',
					componentId: args.componentId,
					transition: args.transition || 'instant',
					timestamp: args.timestamp || 0
				};

			case 'clear_screen':
				return {
					type: 'clear',
					transition: args.transition || 'fade',
					timestamp: args.timestamp || 0
				};

			case 'speak':
				return {
					type: 'speak',
					text: args.text,
					rate: args.rate || 1,
					pitch: args.pitch || 1,
					timestamp: args.timestamp || 0
				};

			case 'search_images':
				// This doesn't generate an event - it just returns data
				// The agent will use the returned imageUrl in a subsequent add_component call
				return null;

			case 'get_current_state':
				// This doesn't generate an event
				return null;

			default:
				return null;
		}
	}
}

// Note: Create new instances with API key in your route handlers
// Example: const agent = new PresentationAgent(apiKey);
