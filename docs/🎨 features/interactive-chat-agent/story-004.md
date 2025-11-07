# Story 004: Interactive Chat Agent

## Status
✅ Complete

## Overview
Replace the slow, rigid presentation agent with a fast, interactive chat agent that generates single-page responses with visual components. Users can have a conversation, ask follow-up questions, and the agent maintains context and component state (IDs, references, etc.).

## Problem Statement

### Current Issues
1. **Too Slow**: Multi-slide generation takes 10-30 seconds
2. **Not Interactive**: Can't ask follow-up questions naturally
3. **Rigid Structure**: Forced slide 1, slide 2, slide 3 format
4. **Poor UX**: User waits for entire presentation before interacting
5. **Monolithic Prompts**: 800+ line prompt files that are unmaintainable
6. **No Context**: Each request starts fresh, no conversation history

### User Pain Points
- "I just want a quick answer with a diagram"
- "Why do I have to wait for 8 slides when I asked a simple question?"
- "I want to ask follow-up questions about the chart you just showed"
- "Can you update that diagram instead of creating a new one?"

## Goals

### Primary Goals
1. **Fast Responses**: < 3 seconds for typical queries
2. **Interactive Conversation**: Maintain chat history and context
3. **Single-Page Responses**: One focused response per message
4. **Component State**: Remember component IDs for updates/references
5. **Modular Prompts**: Clean, maintainable prompt system with templates
6. **Visual When Needed**: Still use charts, diagrams, code blocks, etc.

### Success Metrics
- Response time < 3 seconds for 80% of queries
- Users can have 5+ turn conversations
- Component references work (e.g., "update that chart")
- Prompt system is < 200 lines per file
- Easy to add new component examples

## User Stories

### As a user
- I want quick answers to my questions so I don't waste time waiting
- I want to ask follow-up questions so I can explore topics naturally
- I want the agent to remember what we talked about so I don't repeat myself
- I want visual components when they help so I can understand better

### As a developer
- I want modular prompts so I can maintain and update them easily
- I want clear separation of concerns so I can test components independently
- I want reusable templates so I don't duplicate prompt logic

## Technical Approach

### Architecture

```
src/lib/agent/
├── chat/
│   ├── ChatAgent.ts              # Main chat agent class
│   ├── ConversationHistory.ts    # Manages chat history
│   ├── ComponentRegistry.ts      # Tracks component IDs/state
│   └── prompts/
│       ├── system.ts              # Core system prompt
│       ├── examples.ts            # Component examples
│       ├── tools.ts               # Tool descriptions
│       └── templates.ts           # Prompt templates
```

### Key Features

**1. Conversation History**
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  components?: Component[];
  timestamp: number;
}

class ConversationHistory {
  messages: Message[] = [];
  
  addMessage(role, content, components?) { }
  getContext(maxTokens: number): Message[] { }
  getComponentById(id: string): Component | null { }
}
```

**2. Component Registry**
```typescript
class ComponentRegistry {
  components: Map<string, Component> = new Map();
  
  register(component: Component): void { }
  get(id: string): Component | null { }
  update(id: string, updates: Partial<Component>): void { }
  list(): Component[] { }
}
```

**3. Modular Prompts**
```typescript
// prompts/system.ts
export const SYSTEM_PROMPT = `You are a helpful assistant that can create visual components.`;

// prompts/examples.ts
export const COMPONENT_EXAMPLES = {
  chart: `Example: {"type":"bar","data":[...]}`,
  diagram: `Example: {"type":"mermaid","diagram":"..."}`,
  // ...
};

// prompts/templates.ts
export function buildPrompt(history, components, tools) {
  return `${SYSTEM_PROMPT}
  
${formatHistory(history)}

Available components: ${Object.keys(COMPONENT_EXAMPLES).join(', ')}

${formatTools(tools)}`;
}
```

**4. Fast Single-Page Responses**
```typescript
async chat(userMessage: string): Promise<Response> {
  // Add to history
  this.history.addMessage('user', userMessage);
  
  // Build context-aware prompt
  const prompt = buildPrompt(
    this.history.getContext(2000),
    this.registry.list(),
    this.tools
  );
  
  // Generate response (single page, fast)
  const response = await this.model.invoke(prompt);
  
  // Parse components
  const components = extractComponents(response);
  
  // Register components
  components.forEach(c => this.registry.register(c));
  
  // Add to history
  this.history.addMessage('assistant', response, components);
  
  return { text: response, components };
}
```

## Implementation Plan

### Phase 1: Modular Prompt System
- [ ] Create `src/lib/agent/chat/prompts/` directory
- [ ] Extract system prompt to `system.ts`
- [ ] Extract component examples to `examples.ts`
- [ ] Extract tool descriptions to `tools.ts`
- [ ] Create prompt builder in `templates.ts`
- [ ] Add tests for prompt building

### Phase 2: Conversation Management
- [ ] Create `ConversationHistory.ts` class
- [ ] Implement message storage with timestamps
- [ ] Implement context window management (token limits)
- [ ] Add component extraction from messages
- [ ] Add tests for history management

### Phase 3: Component Registry
- [ ] Create `ComponentRegistry.ts` class
- [ ] Implement component registration
- [ ] Implement component lookup by ID
- [ ] Implement component updates
- [ ] Add tests for registry operations

### Phase 4: Chat Agent
- [ ] Create `ChatAgent.ts` main class
- [ ] Integrate conversation history
- [ ] Integrate component registry
- [ ] Implement single-turn chat method
- [ ] Add streaming support for responses
- [ ] Add tests for chat agent

### Phase 5: API Integration
- [ ] Create `/api/chat` endpoint
- [ ] Support streaming responses
- [ ] Handle conversation history in session
- [ ] Return components with responses
- [ ] Add error handling

### Phase 6: UI Updates
- [ ] Add chat mode toggle in UI
- [ ] Update quick chat to use chat agent
- [ ] Display components inline with messages
- [ ] Show conversation history
- [ ] Add "update component" interactions

### Phase 7: Testing & Refinement
- [ ] Test multi-turn conversations
- [ ] Test component references ("update that chart")
- [ ] Test response times
- [ ] Optimize prompt size
- [ ] Gather user feedback

## Acceptance Criteria

### Must Have
- [ ] Response time < 3 seconds for simple queries
- [ ] Conversation history maintained across turns
- [ ] Component IDs tracked and referenceable
- [ ] Modular prompt system (< 200 lines per file)
- [ ] Can generate charts, diagrams, code blocks
- [ ] Can update existing components by reference

### Should Have
- [ ] Streaming responses for better UX
- [ ] Smart context window management
- [ ] Component state persistence across sessions
- [ ] Graceful degradation if tools fail

### Nice to Have
- [ ] Voice input for questions
- [ ] Component animations on updates
- [ ] Export conversation as presentation
- [ ] Suggested follow-up questions

## Design Examples

### Example 1: Quick Question with Chart

**User**: "Show me browser market share"

**Agent** (< 2 seconds):
```
Here's the current browser market share:

[PIE CHART COMPONENT]

Chrome dominates with 65%, followed by Safari at 20%, Edge at 5%, and Firefox at 4%.
```

### Example 2: Follow-up Question

**User**: "What about mobile?"

**Agent** (< 2 seconds):
```
On mobile, the distribution is different:

[PIE CHART COMPONENT - NEW ID]

Safari leads on mobile with 55% (iOS), Chrome has 40%, and others make up 5%.
```

### Example 3: Component Update

**User**: "Update the first chart to show 2023 data"

**Agent** (< 2 seconds):
```
I've updated the chart with 2023 data:

[PIE CHART COMPONENT - SAME ID, UPDATED DATA]

In 2023, Chrome's share increased to 68%, while Firefox dropped to 3%.
```

### Example 4: Technical Question with Code

**User**: "How do I use React hooks?"

**Agent** (< 2 seconds):
```
React hooks let you use state in functional components. Here's a basic example:

[CODE COMPONENT]

The useState hook returns a state variable and a function to update it. Call it at the top level of your component.
```

## Technical Considerations

### Performance
- Keep prompts under 2000 tokens for fast responses
- Use streaming for better perceived performance
- Cache tool results when possible
- Limit conversation history to last 10 messages

### Prompt Management
- Use TypeScript for type safety
- Keep examples concise (1-2 per component type)
- Use template literals for readability
- Version prompts for A/B testing

### State Management
- Store conversation in session storage
- Persist component registry per session
- Clear old sessions after 24 hours
- Handle concurrent requests gracefully

### Error Handling
- Graceful fallback if component generation fails
- Retry logic for API failures
- Clear error messages to user
- Log errors for debugging

## Migration Strategy

### Coexistence
- Keep old presentation agent for "presentation mode"
- Add new chat agent for "chat mode"
- Let users choose mode (default to chat)
- Gradually deprecate presentation mode

### Data Migration
- No data migration needed (new feature)
- Sessions can have both modes
- Component IDs are compatible

## Risks & Mitigations

### Risk: Responses Too Slow
**Mitigation**: 
- Optimize prompt size
- Use faster models (Claude Haiku)
- Implement caching
- Show loading indicators

### Risk: Context Window Overflow
**Mitigation**:
- Implement smart truncation
- Summarize old messages
- Prioritize recent context
- Warn user when history is truncated

### Risk: Component References Break
**Mitigation**:
- Robust ID generation
- Validate references before updates
- Fallback to creating new component
- Clear error messages

### Risk: Prompt Maintenance Nightmare
**Mitigation**:
- Modular structure from day 1
- Clear documentation
- Version control for prompts
- Automated tests

## Success Indicators

1. **Speed**: 90% of responses < 3 seconds
2. **Engagement**: Users have 5+ turn conversations
3. **Accuracy**: Component references work 95% of time
4. **Maintainability**: New examples added in < 10 minutes
5. **User Satisfaction**: Positive feedback on interactivity

## Related Documents
- [Story 003: Content Density Overhaul](../content-density-overhaul/story-003.md)
- [ADR-004: Component DSL](../../🏗️ architecture/decisions/ADR-004-component-dsl.md)

## Timeline Estimate
- **Phase 1-3 (Foundation)**: 3-4 hours
- **Phase 4-5 (Agent & API)**: 3-4 hours
- **Phase 6-7 (UI & Testing)**: 2-3 hours
- **Total**: 8-11 hours

## Author
AI Presentation App Team

## Date
2025-11-07
