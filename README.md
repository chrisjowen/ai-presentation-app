# AI Presentations 🎭

A revolutionary way to interact with AI agents - no chat interface, just immersive full-screen presentations with synchronized voice narration.

## Overview

Instead of scrolling through endless chat messages, experience AI responses as dynamic PowerPoint-style presentations. The AI agent orchestrates visual components (text, images, grids) with text-to-speech narration, creating a theatrical presentation experience.

## Features

- **Component-Based DSL**: JSON-based presentation language with text, images, and grid layouts
- **Timeline Orchestration**: Choreographed updates with transitions (fade, slide, instant)
- **Voice Narration**: Browser-based text-to-speech synchronized with visual changes
- **Interactive**: Pause anytime with spacebar and ask questions via voice input
- **LangGraph Agent**: ReAct agent with tools to control the presentation UI
- **Session Management**: Multiple sessions with state persistence

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5 (runes), Tailwind CSS
- **Agent**: LangGraph.js + Claude 3.5 Sonnet via Anthropic API
- **State Management**: Svelte 5 runes
- **Speech**: Web Speech API (TTS + STT)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- Anthropic API key

### Installation

1. Clone and install dependencies:
```sh
pnpm install
```

2. Set up environment variables:
```sh
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

3. Start the dev server:
```sh
pnpm run dev
```

4. Open http://localhost:5174/

## Usage

### View Demo
Click "View Demo" on the homepage to see a sample presentation with voice narration and transitions.

### Create a Session
1. Click "Create New Session" to start fresh
2. The agent will wait for your input
3. Press **SPACE** to pause and activate microphone
4. Speak your question or request
5. The agent will create a presentation to respond

### Example Prompts
- "Tell me about the solar system"
- "Explain how machine learning works"
- "Show me a comparison of programming languages"
- "Create a presentation about climate change"

## Architecture

### Component Registry
Defined in `src/lib/types/components.ts`:
- `TextComponent`: Display text with styling
- `ImageComponent`: Display images
- `GridComponent`: Layout container

### Timeline DSL
Defined in `src/lib/types/timeline.ts`:
- `add`: Add component
- `update`: Update component
- `remove`: Remove component
- `clear`: Clear screen
- `speak`: Text-to-speech

### Agent Tools
The LangGraph agent has access to:
- `add_component`: Add UI elements
- `update_component`: Modify existing elements
- `remove_component`: Remove elements
- `clear_screen`: Clear all
- `speak`: Narrate text
- `get_current_state`: Query current screen

### Project Structure
```
src/
├── lib/
│   ├── agent/
│   │   ├── graph.ts (LangGraph ReAct agent)
│   │   ├── tools.ts (UI control tools)
│   │   └── state.ts (Agent state management)
│   ├── types/
│   │   ├── components.ts (Component registry)
│   │   └── timeline.ts (Timeline DSL)
│   ├── components/
│   │   ├── ComponentRenderer.svelte
│   │   ├── TextComponent.svelte
│   │   ├── ImageComponent.svelte
│   │   └── GridComponent.svelte
│   ├── stores/
│   │   └── presentation.svelte.ts (Timeline orchestrator)
│   └── server/
│       └── sessions.ts (Session storage)
└── routes/
    ├── +page.svelte (Home)
    ├── demo/+page.svelte (Demo)
    ├── session/[sessionId]/
    │   └── +page.svelte (Presentation viewer)
    └── api/sessions/[sessionId]/
        ├── +server.ts (GET/POST/DELETE)
        └── message/+server.ts (Agent endpoint)
```

## Development

### Adding New Components
1. Define type in `src/lib/types/components.ts`
2. Add to `COMPONENT_REGISTRY`
3. Create Svelte component in `src/lib/components/`
4. Update `ComponentRenderer.svelte`

### Customizing Agent Behavior
Edit the system prompt in `src/lib/agent/graph.ts` to change how the agent creates presentations.

### Adding New Tools
1. Define tool in `src/lib/agent/tools.ts` using Zod schemas
2. Add to `allTools` array
3. Handle in `toolCallToEvent()` in `graph.ts`

## Deployment

Build for production:
```sh
pnpm run build
```

Preview production build:
```sh
pnpm run preview
```

The app uses `@sveltejs/adapter-node` for deployment to Node.js environments.

## Future Enhancements

- [ ] Charts and data visualizations
- [ ] WebSocket for real-time updates
- [ ] Conversation history per session
- [ ] Custom component plugins
- [ ] Presentation templates
- [ ] Export presentations
- [ ] Multi-user collaboration

## License

MIT

## Credits

Built with SvelteKit, LangGraph, and Claude AI.
