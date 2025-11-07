# Implementation Plan: Interactive Chat Agent

## Story Reference
[Story 004: Interactive Chat Agent](./story-004.md)

## Confidence Score
**8/10** - Clear architecture, well-defined scope, proven patterns

## Implementation Phases

### Phase 1: Modular Prompt System ⏱️ 1-1.5 hours

#### Tasks
- [x] Create directory structure `src/lib/agent/chat/prompts/`
- [ ] Create `system.ts` - Core system prompt (concise, clear role)
- [ ] Create `examples.ts` - Component examples (1-2 per type)
- [ ] Create `tools.ts` - Tool descriptions (search, Wikipedia)
- [ ] Create `templates.ts` - Prompt builder functions
- [ ] Create `types.ts` - TypeScript interfaces for prompts

#### Files to Create
```
src/lib/agent/chat/prompts/
├── system.ts          # System prompt
├── examples.ts        # Component examples
├── tools.ts           # Tool descriptions
├── templates.ts       # Prompt builders
└── types.ts           # Type definitions
```

#### Acceptance Criteria
- Each file < 150 lines
- Clear separation of concerns
- Type-safe prompt building
- Easy to add new examples

---

### Phase 2: Conversation Management ⏱️ 1-1.5 hours

#### Tasks
- [ ] Create `ConversationHistory.ts`
- [ ] Implement message storage with timestamps
- [ ] Implement context window management (max 2000 tokens)
- [ ] Add component extraction from messages
- [ ] Add message summarization for old context
- [ ] Write unit tests

#### Key Methods
```typescript
class ConversationHistory {
  addMessage(role, content, components?)
  getContext(maxTokens): Message[]
  getComponentById(id): Component | null
  clear()
  summarize(messages): string
}
```

#### Acceptance Criteria
- Stores unlimited messages
- Returns last N messages within token limit
- Can find components by ID
- Handles edge cases (empty history, etc.)

---

### Phase 3: Component Registry ⏱️ 0.5-1 hour

#### Tasks
- [ ] Create `ComponentRegistry.ts`
- [ ] Implement component registration with unique IDs
- [ ] Implement component lookup
- [ ] Implement component updates
- [ ] Add component listing
- [ ] Write unit tests

#### Key Methods
```typescript
class ComponentRegistry {
  register(component): string  // Returns ID
  get(id): Component | null
  update(id, updates): boolean
  list(): Component[]
  clear()
}
```

#### Acceptance Criteria
- Generates unique IDs
- Fast lookups (Map-based)
- Immutable updates
- Thread-safe operations

---

### Phase 4: Chat Agent ⏱️ 1.5-2 hours

#### Tasks
- [ ] Create `ChatAgent.ts` main class
- [ ] Integrate ConversationHistory
- [ ] Integrate ComponentRegistry
- [ ] Implement `chat(message)` method
- [ ] Implement `streamChat(message)` method
- [ ] Add tool integration (search, Wikipedia)
- [ ] Parse and extract components from responses
- [ ] Write integration tests

#### Key Methods
```typescript
class ChatAgent {
  constructor(apiKey, modelId)
  chat(message): Promise<ChatResponse>
  streamChat(message): AsyncGenerator<ChatChunk>
  reset()
}

interface ChatResponse {
  text: string;
  components: Component[];
  conversationId: string;
}
```

#### Acceptance Criteria
- Response time < 3 seconds for simple queries
- Maintains conversation context
- Extracts components correctly
- Handles errors gracefully

---

### Phase 5: API Integration ⏱️ 1-1.5 hours

#### Tasks
- [ ] Create `/api/chat/+server.ts` endpoint
- [ ] Support POST for single messages
- [ ] Support streaming responses (SSE)
- [ ] Store conversation in session
- [ ] Return components with responses
- [ ] Add error handling and logging
- [ ] Add rate limiting

#### Endpoints
```
POST /api/chat
Body: { message: string, sessionId: string }
Response: { text: string, components: Component[], conversationId: string }

GET /api/chat/stream
Query: message, sessionId
Response: Server-Sent Events stream
```

#### Acceptance Criteria
- Handles concurrent requests
- Persists conversation per session
- Returns proper error codes
- Logs for debugging

---

### Phase 6: UI Updates ⏱️ 1.5-2 hours

#### Tasks
- [ ] Add chat mode toggle in session page
- [ ] Update quick chat to use chat agent
- [ ] Display components inline with messages
- [ ] Show conversation history (scrollable)
- [ ] Add loading indicators
- [ ] Add error states
- [ ] Style chat bubbles (user vs assistant)
- [ ] Add component update interactions

#### UI Components
```
<ChatMode>
  <ConversationHistory>
    <Message role="user">...</Message>
    <Message role="assistant">
      <Text>...</Text>
      <Component>...</Component>
    </Message>
  </ConversationHistory>
  <ChatInput />
</ChatMode>
```

#### Acceptance Criteria
- Clean, readable chat interface
- Components render inline
- Smooth scrolling
- Responsive design
- Keyboard shortcuts work

---

### Phase 7: Testing & Refinement ⏱️ 1-1.5 hours

#### Tasks
- [ ] Test multi-turn conversations (5+ turns)
- [ ] Test component references ("update that chart")
- [ ] Test response times (measure p50, p95, p99)
- [ ] Test error scenarios (API failures, invalid input)
- [ ] Optimize prompt size if needed
- [ ] Add performance monitoring
- [ ] Gather initial user feedback
- [ ] Document usage patterns

#### Test Scenarios
1. Simple question → Quick answer
2. Question with chart → Chart component
3. Follow-up question → Uses context
4. Update component → References existing ID
5. Complex query → Multiple components
6. Error handling → Graceful degradation

#### Acceptance Criteria
- All test scenarios pass
- Response time < 3 seconds (p95)
- No memory leaks
- Error rate < 1%

---

## File Structure

```
src/lib/agent/chat/
├── ChatAgent.ts                 # Main agent class
├── ConversationHistory.ts       # History management
├── ComponentRegistry.ts         # Component tracking
├── prompts/
│   ├── system.ts                # System prompt
│   ├── examples.ts              # Component examples
│   ├── tools.ts                 # Tool descriptions
│   ├── templates.ts             # Prompt builders
│   └── types.ts                 # Type definitions
└── __tests__/
    ├── ChatAgent.test.ts
    ├── ConversationHistory.test.ts
    └── ComponentRegistry.test.ts

src/routes/api/chat/
└── +server.ts                   # API endpoint

src/routes/session/[sessionId]/
└── ChatMode.svelte              # Chat UI component
```

## Dependencies

### New Dependencies
None - use existing LangChain, Anthropic, OpenAI packages

### Existing Dependencies
- `@langchain/anthropic`
- `@langchain/openai`
- `@langchain/core`

## Testing Strategy

### Unit Tests
- ConversationHistory: message storage, context window
- ComponentRegistry: CRUD operations
- Prompt builders: template generation

### Integration Tests
- ChatAgent: end-to-end chat flow
- API: request/response handling
- UI: component rendering

### Performance Tests
- Response time benchmarks
- Memory usage monitoring
- Concurrent request handling

## Rollout Plan

### Phase 1: Internal Testing
- Deploy to dev environment
- Test with team
- Gather feedback
- Fix critical bugs

### Phase 2: Beta Release
- Add "Chat Mode (Beta)" toggle
- Keep presentation mode as default
- Monitor usage and errors
- Iterate based on feedback

### Phase 3: General Availability
- Make chat mode default
- Keep presentation mode as option
- Full documentation
- Announce to users

## Rollback Plan

If critical issues arise:
1. Disable chat mode toggle
2. Revert to presentation mode only
3. Fix issues in separate branch
4. Re-deploy when stable

## Monitoring & Metrics

### Key Metrics
- Response time (p50, p95, p99)
- Error rate
- Conversation length (turns)
- Component reference success rate
- User satisfaction (feedback)

### Alerts
- Response time > 5 seconds
- Error rate > 5%
- API failures

## Documentation

### User Documentation
- How to use chat mode
- Example conversations
- Component reference syntax
- Troubleshooting guide

### Developer Documentation
- Architecture overview
- Prompt system guide
- Adding new component types
- Testing guide

## Success Criteria

### Technical
- [ ] All phases completed
- [ ] All tests passing
- [ ] Response time < 3 seconds (p95)
- [ ] Error rate < 1%
- [ ] Code coverage > 80%

### User Experience
- [ ] Users can have 5+ turn conversations
- [ ] Component references work reliably
- [ ] Positive user feedback
- [ ] Adoption rate > 50%

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 1-1.5h | None |
| Phase 2 | 1-1.5h | Phase 1 |
| Phase 3 | 0.5-1h | None |
| Phase 4 | 1.5-2h | Phases 1-3 |
| Phase 5 | 1-1.5h | Phase 4 |
| Phase 6 | 1.5-2h | Phase 5 |
| Phase 7 | 1-1.5h | Phases 4-6 |
| **Total** | **8-11h** | |

## Notes

- Start with Claude Haiku for speed, upgrade to Sonnet if quality issues
- Keep prompts under 2000 tokens for fast responses
- Use streaming for better UX
- Component IDs must be stable across updates
- Consider adding "export as presentation" feature later

## Author
AI Presentation App Team

## Date
2025-11-07
