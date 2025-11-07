# AI Presentations - System Architecture Overview

## Executive Summary

AI Presentations is a SvelteKit-based web application that uses LangGraph.js ReAct agents to generate immersive, interactive presentations with synchronized voice narration. The system combines a component-based presentation DSL, timeline orchestration, and AI agent tools to create theatrical learning experiences.

## Architecture Principles

1. **Component-Based Design**: Modular, reusable UI components with clear contracts
2. **Reactive State Management**: Svelte 5 runes for fine-grained reactivity
3. **Agent-Driven UI**: LangGraph ReAct agent orchestrates presentation flow
4. **Performance First**: Fast interactions, smooth animations, optimized rendering
5. **Type Safety**: Comprehensive TypeScript usage throughout

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SvelteKit Frontend (Svelte 5 + Runes)                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │  Routing    │  │ Presentation │  │   Speech     │ │  │
│  │  │   Pages     │  │    Store     │  │  (TTS/STT)   │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      Component Renderer                         │  │  │
│  │  │  TextComponent | ImageComponent | GridComponent │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │ HTTP/SSE
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Server                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  API Routes      │  │   Session Storage            │    │
│  │  /api/sessions/* │  │   (In-memory / Database)     │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         LangGraph.js Agent (ReAct)                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   State    │  │   Tools    │  │   Claude AI  │  │   │
│  │  │  Manager   │  │ Executor   │  │   via API    │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
                  ┌──────────────────┐
                  │  Anthropic API   │
                  │  Claude 3.5      │
                  └──────────────────┘
```

## Core Components

### 1. Frontend Layer (SvelteKit + Svelte 5)

#### Routing Structure
```
src/routes/
├── +page.svelte                    # Homepage (session list)
├── demo/+page.svelte               # Static demo presentation
└── session/[sessionId]/
    └── +page.svelte                # Live presentation viewer
```

#### Presentation Store (`src/lib/stores/presentation.svelte.ts`)
**Responsibility**: Timeline orchestration and state management

**Key Features**:
- Component registry management (add, update, remove)
- Timeline event execution with transitions
- Speech synthesis coordination
- State persistence and hydration

**Technology**: Svelte 5 runes (`$state`, `$derived`, `$effect`)

#### Component System (`src/lib/components/`)
**Component Registry**:
- `TextComponent.svelte`: Text display with styling (size, weight, alignment)
- `ImageComponent.svelte`: Image rendering with sizing
- `GridComponent.svelte`: Layout container for nested components
- `MermaidComponent.svelte`: Diagram rendering
- `ComponentRenderer.svelte`: Dynamic component instantiation

**Design Pattern**: Component-based with TypeScript interfaces for type safety

### 2. Agent Layer (LangGraph.js)

#### Agent Architecture (`src/lib/agent/`)

**State Management** (`state.ts`):
```typescript
interface AgentState {
  messages: BaseMessage[]        // Conversation history
  currentComponents: Record<string, Component>  // UI state snapshot
}
```

**ReAct Agent** (`graph.ts`):
- Uses Claude 3.5 Sonnet for reasoning
- Follows ReAct pattern: Reason → Act → Observe → Repeat
- System prompt defines presentation creation behavior
- Tool calling enables UI manipulation

**Agent Tools** (`tools.ts`):
- `add_component`: Create new UI elements
- `update_component`: Modify existing elements
- `remove_component`: Delete elements
- `clear_screen`: Reset presentation
- `speak`: Queue narration
- `get_current_state`: Query UI state

**Tool Execution Flow**:
1. Agent decides which tool to call based on user input
2. Tool executed, returns timeline event
3. Event sent to frontend via streaming response
4. Presentation store applies event with transitions

### 3. Backend Layer (SvelteKit Server)

#### Session Management (`src/lib/server/sessions.ts`)
**Storage**: In-memory map (can be extended to database)

**Session Structure**:
```typescript
interface Session {
  id: string
  createdAt: Date
  state: AgentState
  timeline: TimelineEvent[]
}
```

**Operations**:
- `createSession()`: Initialize new agent session
- `getSession()`: Retrieve session by ID
- `updateSession()`: Persist state changes
- `deleteSession()`: Clean up resources

#### API Routes (`src/routes/api/sessions/`)

**`[sessionId]/+server.ts`**:
- `GET`: Retrieve session data
- `POST`: Create new session
- `DELETE`: Remove session

**`[sessionId]/message/+server.ts`**:
- `POST`: Send user message to agent
- Returns streaming response with timeline events
- Handles agent execution and error recovery

## Data Flow

### User Interaction Flow

```
User Input (Voice/Text)
  │
  ├─> Frontend captures input
  │
  ├─> POST /api/sessions/[id]/message
  │
  ├─> Agent processes with LangGraph
  │     │
  │     ├─> Claude API call (reasoning)
  │     ├─> Tool execution (add_component, speak, etc.)
  │     └─> Generate timeline events
  │
  ├─> Stream events back to frontend
  │
  ├─> Presentation store applies events
  │     │
  │     ├─> Update component registry
  │     ├─> Trigger transitions (fade, slide)
  │     └─> Queue speech synthesis
  │
  └─> User sees presentation + hears narration
```

### Component Lifecycle

```
1. Agent calls add_component tool
     ↓
2. Tool generates TimelineEvent (action: "add")
     ↓
3. Event streamed to frontend
     ↓
4. Presentation store receives event
     ↓
5. Component added to registry with transition
     ↓
6. ComponentRenderer instantiates Svelte component
     ↓
7. Component rendered with transition animation
     ↓
8. Narration synchronized with visual appearance
```

## Technology Stack

### Frontend
- **Framework**: SvelteKit 2 (SSR + Client-side routing)
- **UI Library**: Svelte 5 (runes for reactivity)
- **Styling**: Tailwind CSS 4
- **Type Safety**: TypeScript 5
- **Speech**: Web Speech API (TTS + STT)
- **Markdown**: Marked.js for rich text
- **Diagrams**: Mermaid.js
- **Code Highlighting**: Shiki

### Backend
- **Runtime**: Node.js 20+
- **Framework**: SvelteKit (server routes)
- **Agent Framework**: LangGraph.js 0.4+
- **LLM**: Claude 3.5 Sonnet via Anthropic API
- **Type Safety**: TypeScript 5
- **Validation**: Zod schemas

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint 9
- **Formatting**: Prettier 3
- **Testing**: Playwright (E2E)
- **Build**: Vite 7

### Dependencies
```json
{
  "@langchain/anthropic": "^0.3.31",
  "@langchain/langgraph": "^0.4.9",
  "marked": "^16.4.0",
  "mermaid": "^11.12.0",
  "shiki": "^3.13.0",
  "zod": "^3.23.8"
}
```

## Key Design Decisions

### 1. Svelte 5 Runes Over Stores
**Decision**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for reactive state

**Rationale**:
- Fine-grained reactivity with better performance
- Simpler mental model than traditional stores
- Automatic dependency tracking
- Better TypeScript integration

### 2. LangGraph ReAct Agent
**Decision**: Use LangGraph.js with ReAct pattern for agent orchestration

**Rationale**:
- Structured agentic workflow (not raw LLM calls)
- Built-in state management and tool execution
- Extensible with custom tools
- Better error handling and observability

### 3. Component-Based DSL
**Decision**: JSON-based timeline events with typed component registry

**Rationale**:
- Type-safe agent outputs (Zod validation)
- Clear separation between agent logic and UI
- Easy to extend with new component types
- Testable at component and event level

### 4. Browser-Native Speech APIs
**Decision**: Use Web Speech API instead of external TTS service

**Rationale**:
- Zero latency for TTS (local synthesis)
- No additional API costs
- Works offline after initial load
- Native browser support (Chrome, Edge, Safari)

## Performance Considerations

### Current Performance Profile
- **Time to First Render**: ~1-2s (SvelteKit SSR + hydration)
- **Agent Response Time**: ~2-4s (Claude API call + tool execution)
- **Component Update Latency**: < 100ms (reactive state updates)
- **Speech Synthesis Delay**: < 500ms (browser TTS queue)

### Optimization Opportunities
1. **Streaming Improvements**: Stream individual tool calls instead of batching
2. **Component Preloading**: Lazy load heavy components (Mermaid, Shiki)
3. **State Minimization**: Reduce state size in agent for faster processing
4. **Caching**: Cache common presentations or component trees
5. **Parallel Tool Execution**: Execute independent tools concurrently

## Security Architecture

### Current Security Measures
- API keys stored in environment variables (`.env`)
- No sensitive data in client-side code
- Session IDs are UUIDs (not guessable)
- Input validation with Zod schemas

### Required Security Enhancements
1. **Secret Scanning**: Add pre-commit hooks to prevent credential leaks
2. **Input Sanitization**: Validate and sanitize user inputs
3. **Rate Limiting**: Prevent API abuse
4. **Session Expiry**: Implement TTL for session cleanup
5. **CORS Configuration**: Restrict API access to known origins

## Scalability

### Current Limitations
- **Session Storage**: In-memory (lost on server restart)
- **Concurrency**: Limited by single-server Node.js process
- **API Costs**: Each request requires Claude API call

### Scaling Strategy
1. **Session Persistence**: Migrate to Redis or database
2. **Horizontal Scaling**: Deploy multiple server instances
3. **Caching Layer**: Cache agent responses for common queries
4. **WebSocket**: Use WS instead of HTTP streaming for lower latency
5. **Edge Functions**: Deploy API routes to edge for lower latency

## Testing Strategy

### Current State
- **E2E Tests**: Playwright setup (minimal coverage)
- **Unit Tests**: Not implemented
- **Integration Tests**: Not implemented

### Required Testing Coverage
1. **Component Tests**: Each UI component in isolation
2. **Agent Tests**: Tool execution and state management
3. **Integration Tests**: Full user flows (session → message → presentation)
4. **Performance Tests**: Latency benchmarks
5. **Security Tests**: Input validation, secret exposure

See [testing-standards.md](../💻%20coding-standards/testing-standards.md) for detailed guidelines.

## Deployment

### Current Setup
- **Adapter**: `@sveltejs/adapter-auto` (auto-detects platform)
- **Build**: `pnpm run build`
- **Preview**: `pnpm run preview`

### Deployment Options
1. **Vercel**: Zero-config, serverless functions
2. **Netlify**: Similar to Vercel with edge functions
3. **Docker**: Containerized with adapter-node
4. **VPS**: Direct deployment with PM2 or systemd

## Future Architecture Evolution

### Short-Term Enhancements
1. **Component Library Expansion**: Add charts, code blocks, tables
2. **Conversation Memory**: Multi-turn context awareness
3. **User Preferences**: Save voice, theme, speed settings
4. **Export Functionality**: Download presentations as PDF/video

### Long-Term Vision
1. **Multi-User Collaboration**: Real-time co-viewing and annotations
2. **Plugin System**: Custom component registration
3. **Template Library**: Pre-built presentation structures
4. **Analytics**: Track engagement and learning outcomes
5. **Mobile Apps**: Native iOS/Android with offline support

## Appendix

### Key Files Reference
- Agent graph: [src/lib/agent/graph.ts](../../src/lib/agent/graph.ts)
- Agent tools: [src/lib/agent/tools.ts](../../src/lib/agent/tools.ts)
- Presentation store: [src/lib/stores/presentation.svelte.ts](../../src/lib/stores/presentation.svelte.ts)
- Component types: [src/lib/types/components.ts](../../src/lib/types/components.ts)
- Session management: [src/lib/server/sessions.ts](../../src/lib/server/sessions.ts)

### Related Documentation
- [Business Overview](./business-overview.md)
- [TypeScript Standards](../💻%20coding-standards/typescript-standards.md)
- [Svelte 5 Standards](../💻%20coding-standards/svelte-standards.md)
- [Testing Standards](../💻%20coding-standards/testing-standards.md)
