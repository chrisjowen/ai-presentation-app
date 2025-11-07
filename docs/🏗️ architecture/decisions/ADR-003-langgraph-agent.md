# ADR-003: LangGraph ReAct Agent Pattern

## Status
Accepted

## Context
The AI Presentations system requires an AI agent that can:
- Reason about user requests and generate appropriate presentations
- Control the UI by calling tools (add/update/remove components, speak)
- Maintain conversation context across multiple interactions
- Handle errors gracefully and recover from failures

We need to decide on the agent architecture pattern:
1. **Raw LLM calls** with manual prompt engineering
2. **Chain-based** architecture (LangChain)
3. **ReAct agent** with tool calling (LangGraph)
4. **State machine** with explicit states

Key considerations:
- **Observability**: Ability to debug agent reasoning
- **Extensibility**: Easy to add new tools and capabilities
- **Reliability**: Error handling and state management
- **Simplicity**: Not over-engineered for the use case

## Decision

We will use **LangGraph.js with the ReAct pattern** for agent orchestration.

**Architecture:**
- **LangGraph** for agent graph management and state
- **ReAct pattern**: Reason → Act → Observe cycle
- **Claude 3.5 Sonnet** as the LLM reasoning engine
- **Zod schemas** for tool input validation
- **Stateful agent** with message history and component tracking

## Rationale

### Why LangGraph Over Alternatives?

**Raw LLM Calls**:
- ❌ Need to manually implement tool calling loop
- ❌ No built-in state management
- ❌ Hard to debug multi-step reasoning
- ❌ Error handling is manual

**LangChain**:
- ⚠️ More complex than needed (agents, chains, memory, retrievers)
- ⚠️ Heavier abstraction layer
- ⚠️ Harder to debug due to multiple layers

**LangGraph (our choice)**:
- ✅ Purpose-built for agentic workflows
- ✅ Clean state management with explicit state types
- ✅ Easy to visualize agent flow
- ✅ Built-in tool calling and error handling
- ✅ TypeScript-first with excellent types
- ✅ Simpler than LangChain for our use case

**Custom State Machine**:
- ❌ Reinventing the wheel
- ❌ Need to implement tool calling from scratch
- ❌ More maintenance burden

### Why ReAct Pattern?

**ReAct (Reason + Act)** cycle:

1. **Reason**: Agent thinks about what action to take
2. **Act**: Agent calls tools to manipulate UI
3. **Observe**: Agent sees tool results
4. **Repeat**: Until task is complete

**Advantages**:
- **Interpretability**: Clear reasoning steps in message history
- **Flexibility**: Agent can adjust plan based on results
- **Debugging**: Easy to see where reasoning went wrong
- **Human-like**: Mirrors how humans approach problems

**Alternative Patterns Considered**:
- **Plan-Execute**: Creates full plan upfront, then executes
  - ❌ Less flexible, can't adapt mid-execution
- **One-shot**: Generate all actions at once
  - ❌ No error recovery, all-or-nothing
- **ReAct (chosen)**: Balance of flexibility and structure

## Architecture

### Agent State

```typescript
interface AgentState {
  messages: BaseMessage[]  // Conversation history (reasoning + tools)
  currentComponents: Record<string, Component>  // UI state snapshot
}
```

**Why this state?**
- `messages`: Enables context-aware responses and multi-turn conversations
- `currentComponents`: Agent knows what's on screen to make informed decisions

### Agent Graph

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   AGENT     │  ← Reason about user request
│  (Claude)   │  → Decide which tools to call
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  Tool Call  │  │  Tool Call  │
│   (add)     │  │   (speak)   │
└──────┬──────┘  └──────┬──────┘
       │              │
       └──────┬───────┘
              ▼
       ┌─────────────┐
       │  Observe    │  ← Tool results
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │    Done?    │
       └──────┬──────┘
              │
         No ─>├──> Loop back to AGENT
              │
         Yes─>▼
       ┌─────────────┐
       │     END     │
       └─────────────┘
```

### Tool Definitions

Tools are the agent's way to manipulate the UI:

```typescript
const addComponentTool = tool(
  async ({ id, type, content, ... }, config) => {
    // Add component to state
    config.configurable.state.currentComponents[id] = { type, content, ... }

    // Return timeline event
    return {
      action: 'add',
      componentId: id,
      component: { type, content, ... },
      transition: 'fade'
    }
  },
  {
    name: 'add_component',
    description: 'Add a new component to the presentation',
    schema: z.object({
      id: z.string(),
      type: z.enum(['text', 'image', 'grid']),
      content: z.string().optional(),
      // ...
    })
  }
)
```

**Available Tools**:
- `add_component`: Create new UI element
- `update_component`: Modify existing element
- `remove_component`: Delete element
- `clear_screen`: Reset presentation
- `speak`: Queue narration
- `get_current_state`: Query what's on screen

### System Prompt

The agent's behavior is guided by a comprehensive system prompt:

```typescript
const systemPrompt = `You are a theatrical presentation agent...

Your goal: Create engaging visual presentations with narration.

Guidelines:
- Use add_component to create text, images, grids
- Use speak for voice narration
- Build presentations incrementally
- Coordinate visuals with speech
- Handle user questions mid-presentation

Available tools: ${toolDescriptions}
`
```

## Implementation Example

```typescript
import { StateGraph } from '@langchain/langgraph'
import { ChatAnthropic } from '@langchain/anthropic'

// 1. Define state
interface AgentState {
  messages: BaseMessage[]
  currentComponents: Record<string, Component>
}

// 2. Create agent node
async function callAgent(state: AgentState) {
  const model = new ChatAnthropic({
    modelName: 'claude-3-5-sonnet-20241022',
    temperature: 0.7
  }).bindTools(allTools)

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages
  ])

  return { messages: [response] }
}

// 3. Create graph
const graph = new StateGraph({ channels: stateSchema })
  .addNode('agent', callAgent)
  .addNode('tools', toolNode)
  .addEdge('__start__', 'agent')
  .addConditionalEdges('agent', shouldContinue, {
    continue: 'tools',
    end: '__end__'
  })
  .addEdge('tools', 'agent')

// 4. Compile and run
const app = graph.compile()
const result = await app.invoke({ messages: [userMessage], currentComponents: {} })
```

## Streaming Timeline Events

Agent tool calls are converted to timeline events and streamed to frontend:

```typescript
async function* streamAgentResponse(userMessage: string, state: AgentState) {
  for await (const chunk of await app.stream({
    messages: [new HumanMessage(userMessage)],
    currentComponents: state.currentComponents
  })) {
    if (chunk.tools) {
      for (const toolCall of chunk.tools.messages) {
        const event = toolCallToTimelineEvent(toolCall)
        yield event  // Stream to frontend
      }
    }
  }
}
```

## Consequences

### Positive
- **Observability**: Full message history shows reasoning steps
- **Extensibility**: Adding new tools is straightforward
- **Reliability**: Built-in error handling and state management
- **Debugging**: LangGraph has visualization tools
- **Flexibility**: ReAct allows dynamic planning
- **TypeScript**: Strong types throughout agent code

### Negative
- **Latency**: Multiple LLM calls in ReAct loop add latency
- **Token usage**: Conversation history grows with each interaction
- **Complexity**: LangGraph adds dependency and learning curve
- **Determinism**: Agent behavior is non-deterministic

### Trade-offs
- **Latency vs. Flexibility**: ReAct is slower than one-shot but more adaptive
- **Simplicity vs. Structure**: Could be simpler with raw API calls, but harder to maintain

## Error Handling

### Tool Execution Errors

```typescript
async function safeTool(tool: Tool) {
  try {
    return await tool.invoke(params)
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

### Agent Recovery

If agent gets stuck:
1. Limit max iterations (e.g., 10)
2. Return error message to user
3. Log agent state for debugging

```typescript
const app = graph.compile({
  recursionLimit: 10  // Max iterations
})
```

## Performance Considerations

**Token Optimization**:
- Keep system prompt concise
- Trim old messages from history (keep last N)
- Use smaller models for simple tasks

**Latency Reduction**:
- Cache tool schemas (don't regenerate each call)
- Batch tool calls when possible
- Stream responses to frontend for perceived performance

## Testing Strategy

**Unit Tests**:
- Test individual tools in isolation
- Mock LLM responses

**Integration Tests**:
- Test full agent execution with real Claude API
- Verify correct tool sequences for common prompts

**Example**:
```typescript
describe('Agent', () => {
  it('adds component on user request', async () => {
    const result = await agent.invoke({
      messages: [new HumanMessage('Show a title "Hello"')],
      currentComponents: {}
    })

    const toolCalls = result.messages
      .filter(m => m instanceof AIMessage)
      .flatMap(m => m.tool_calls)

    expect(toolCalls).toContainEqual(
      expect.objectContaining({
        name: 'add_component',
        args: expect.objectContaining({
          type: 'text',
          content: expect.stringContaining('Hello')
        })
      })
    )
  })
})
```

## Future Enhancements

1. **Memory**: Add semantic search over previous presentations
2. **Planning**: Introduce explicit planning phase for complex requests
3. **Multi-agent**: Separate reasoning and execution agents
4. **Observability**: Add LangSmith integration for tracing

## Related Decisions
- [ADR-001: Technology Stack](./ADR-001-technology-stack.md)
- [ADR-004: Component-Based Presentation DSL](./ADR-004-component-dsl.md)

## References
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
- [ReAct Paper](https://arxiv.org/abs/2210.03629)
- [Claude Tool Use Guide](https://docs.anthropic.com/claude/docs/tool-use)

## Date
2024-10-15

## Author
Initial project setup
