# ADR-004: Component-Based Presentation DSL

## Status
Accepted

## Context
The AI agent needs a way to communicate UI changes to the frontend. We need a domain-specific language (DSL) for describing presentations that:

- Is simple enough for LLMs to generate correctly
- Is expressive enough for rich, interactive presentations
- Supports transitions and animations
- Enables type-safe communication between agent and UI
- Can be streamed incrementally to the frontend

Key requirements:
- **Agent-friendly**: Easy for LLM to generate (JSON-based, clear structure)
- **Type-safe**: Validated at runtime and compile-time
- **Extensible**: Easy to add new component types
- **Performant**: Enables efficient rendering and updates

## Decision

We will use a **component-based timeline DSL** with:

1. **Component Registry**: Typed component definitions (Text, Image, Grid, etc.)
2. **Timeline Events**: Actions to modify the presentation (add, update, remove, speak)
3. **Zod Schemas**: Runtime validation of agent outputs
4. **Streaming Protocol**: Events streamed to frontend as they're generated

## Architecture

### Component Registry

Each component type has a defined schema:

```typescript
// Component type discriminated union
export type Component = TextComponent | ImageComponent | GridComponent

export interface TextComponent {
  type: 'text'
  content: string
  size?: 'small' | 'medium' | 'large'
  weight?: 'normal' | 'bold'
  align?: 'left' | 'center' | 'right'
  color?: string
}

export interface ImageComponent {
  type: 'image'
  src: string
  alt: string
  size?: 'small' | 'medium' | 'large' | 'full'
}

export interface GridComponent {
  type: 'grid'
  columns: number
  gap?: string
  children: Component[]
}

export const COMPONENT_REGISTRY = {
  text: TextComponent,
  image: ImageComponent,
  grid: GridComponent
} as const
```

### Timeline Events

Events describe changes to the presentation:

```typescript
export type TimelineEvent =
  | AddComponentEvent
  | UpdateComponentEvent
  | RemoveComponentEvent
  | ClearScreenEvent
  | SpeakEvent

export interface AddComponentEvent {
  action: 'add'
  componentId: string
  component: Component
  transition?: Transition
  duration?: number
}

export interface UpdateComponentEvent {
  action: 'update'
  componentId: string
  updates: Partial<Component>
  transition?: Transition
  duration?: number
}

export interface RemoveComponentEvent {
  action: 'remove'
  componentId: string
  transition?: Transition
  duration?: number
}

export interface ClearScreenEvent {
  action: 'clear'
}

export interface SpeakEvent {
  action: 'speak'
  text: string
  rate?: number
  pitch?: number
  voice?: string
}

export type Transition = 'fade' | 'slide' | 'instant'
```

### Zod Validation

All events are validated at runtime:

```typescript
import { z } from 'zod'

export const TextComponentSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  weight: z.enum(['normal', 'bold']).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  color: z.string().optional()
})

export const TimelineEventSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('add'),
    componentId: z.string(),
    component: ComponentSchema,
    transition: z.enum(['fade', 'slide', 'instant']).optional(),
    duration: z.number().optional()
  }),
  // ... other event types
])

// Validate agent output
export function validateTimelineEvent(data: unknown): TimelineEvent {
  return TimelineEventSchema.parse(data)
}
```

## Rationale

### Why Component-Based?

**Pros**:
- **Modularity**: Each component is self-contained
- **Reusability**: Components can be composed
- **Type Safety**: Clear contracts for each component type
- **Extensibility**: Easy to add new component types
- **Testing**: Components can be tested in isolation

**Alternatives Considered**:
- **HTML DSL**: Agent generates raw HTML
  - ❌ Security risk (XSS)
  - ❌ Hard to style consistently
  - ❌ Less structured
- **Markdown-only**: Only text content
  - ❌ Not expressive enough for rich presentations
  - ❌ Limited interactivity

### Why Timeline Events?

**Pros**:
- **Incremental updates**: Can stream events one by one
- **Animations**: Transitions built into event model
- **State management**: Clear history of changes
- **Time-travel**: Can replay events for debugging
- **Undo/redo**: Can reverse events

**Alternatives Considered**:
- **State snapshots**: Send full state each update
  - ❌ Inefficient (large payloads)
  - ❌ No transition information
  - ❌ Can't stream incrementally
- **Imperative commands**: Direct DOM manipulation
  - ❌ Breaks reactive model
  - ❌ Hard to test
  - ❌ No declarative history

### Why Zod?

**Pros**:
- **Runtime validation**: Catch agent errors before rendering
- **Type inference**: TypeScript types derived from schemas
- **Error messages**: Clear validation errors for debugging
- **Composition**: Schemas can be composed and reused

**Alternatives Considered**:
- **TypeScript only**: Compile-time validation
  - ❌ No runtime safety (agent output is unknown)
- **JSON Schema**: Standard schema format
  - ❌ Worse TypeScript integration
  - ❌ Less ergonomic API

## Implementation

### Agent Tool → Timeline Event

```typescript
// Agent calls tool
const toolResult = await addComponentTool.invoke({
  id: 'text-1',
  type: 'text',
  content: 'Hello World',
  size: 'large'
})

// Tool returns timeline event
return {
  action: 'add',
  componentId: 'text-1',
  component: {
    type: 'text',
    content: 'Hello World',
    size: 'large'
  },
  transition: 'fade',
  duration: 300
}
```

### Event Streaming

```typescript
// Backend streams events
export async function* streamPresentationEvents(userMessage: string) {
  for await (const chunk of agentStream) {
    if (chunk.tools) {
      for (const toolCall of chunk.tools.messages) {
        const event = toolCallToTimelineEvent(toolCall)
        yield JSON.stringify(event) + '\n'
      }
    }
  }
}

// Frontend consumes stream
async function handleMessage(message: string) {
  const response = await fetch(`/api/sessions/${id}/message`, {
    method: 'POST',
    body: JSON.stringify({ message })
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value)
    const events = text.split('\n').filter(Boolean).map(JSON.parse)

    for (const event of events) {
      presentationStore.applyEvent(event)
    }
  }
}
```

### Presentation Store

```typescript
class PresentationStore {
  components = $state(new Map<string, Component>())
  timeline = $state<TimelineEvent[]>([])

  applyEvent(event: TimelineEvent) {
    // Validate event
    const validEvent = validateTimelineEvent(event)

    // Add to history
    this.timeline.push(validEvent)

    // Apply to state
    switch (validEvent.action) {
      case 'add':
        this.components.set(validEvent.componentId, validEvent.component)
        break
      case 'update':
        const existing = this.components.get(validEvent.componentId)
        if (existing) {
          this.components.set(validEvent.componentId, {
            ...existing,
            ...validEvent.updates
          })
        }
        break
      case 'remove':
        this.components.delete(validEvent.componentId)
        break
      case 'clear':
        this.components.clear()
        break
      case 'speak':
        speechSynthesis.speak(new SpeechSynthesisUtterance(validEvent.text))
        break
    }
  }
}
```

### Component Renderer

```svelte
<!-- ComponentRenderer.svelte -->
<script lang="ts">
  import type { Component } from '$lib/types/components'
  import TextComponent from './TextComponent.svelte'
  import ImageComponent from './ImageComponent.svelte'
  import GridComponent from './GridComponent.svelte'

  interface Props {
    component: Component
  }

  let { component }: Props = $props()
</script>

{#if component.type === 'text'}
  <TextComponent {...component} />
{:else if component.type === 'image'}
  <ImageComponent {...component} />
{:else if component.type === 'grid'}
  <GridComponent {...component} />
{/if}
```

## Component Examples

### Text Component

```svelte
<!-- TextComponent.svelte -->
<script lang="ts">
  import type { TextComponent } from '$lib/types/components'
  import { marked } from 'marked'

  interface Props extends TextComponent {
    id: string
  }

  let { id, content, size = 'medium', weight = 'normal', align = 'left', color }: Props = $props()

  let html = $derived(marked.parse(content))
</script>

<div
  data-component-id={id}
  class="text-component text-{size} font-{weight} text-{align}"
  style:color
>
  {@html html}
</div>
```

### Grid Component (Composition)

```svelte
<!-- GridComponent.svelte -->
<script lang="ts">
  import type { GridComponent } from '$lib/types/components'
  import ComponentRenderer from './ComponentRenderer.svelte'

  interface Props extends GridComponent {
    id: string
  }

  let { id, columns, gap = '1rem', children }: Props = $props()
</script>

<div
  data-component-id={id}
  class="grid"
  style:grid-template-columns="repeat({columns}, 1fr)"
  style:gap
>
  {#each children as child (child.id)}
    <ComponentRenderer component={child} />
  {/each}
</div>
```

## Extensibility

### Adding New Component Type

1. **Define type**:
```typescript
export interface ChartComponent {
  type: 'chart'
  data: { x: number, y: number }[]
  chartType: 'line' | 'bar' | 'pie'
}
```

2. **Add to union**:
```typescript
export type Component = TextComponent | ImageComponent | GridComponent | ChartComponent
```

3. **Add Zod schema**:
```typescript
export const ChartComponentSchema = z.object({
  type: z.literal('chart'),
  data: z.array(z.object({ x: z.number(), y: z.number() })),
  chartType: z.enum(['line', 'bar', 'pie'])
})
```

4. **Create Svelte component**:
```svelte
<!-- ChartComponent.svelte -->
<script lang="ts">
  import type { ChartComponent } from '$lib/types/components'
  let { data, chartType }: ChartComponent = $props()
  // Render chart...
</script>
```

5. **Update renderer**:
```svelte
{#if component.type === 'chart'}
  <ChartComponent {...component} />
{/if}
```

6. **Add agent tool**:
```typescript
const addChartTool = tool(/* ... */, {
  name: 'add_chart',
  description: 'Add a chart visualization',
  schema: ChartComponentSchema
})
```

## Consequences

### Positive
- **Type Safety**: Compile-time and runtime validation
- **Agent Success**: Simple JSON structure is easy for LLMs
- **Extensibility**: Adding components is straightforward
- **Composability**: Components can be nested (Grid)
- **Testing**: Each component can be tested in isolation
- **Debugging**: Clear event history for troubleshooting

### Negative
- **Abstraction Layer**: Extra layer between agent and UI
- **Schema Maintenance**: Need to keep Zod and TypeScript in sync
- **Limited Flexibility**: Components are pre-defined (not arbitrary HTML)

### Trade-offs
- **Structure vs. Freedom**: More structured than HTML, less flexible
- **Safety vs. Expressiveness**: Safer than raw HTML, but less expressive

## Performance Considerations

**Event Stream**:
- Stream events as they're generated (don't batch)
- Use newline-delimited JSON for simple parsing

**Component Updates**:
- Only update changed components (Map keyed by ID)
- Use Svelte's fine-grained reactivity

**Validation**:
- Validate once on receive, not on every render
- Cache validated events

## Security

**No XSS Risk**:
- Components are pre-defined (not arbitrary HTML)
- Markdown content is sanitized by `marked`
- No `eval` or dynamic code execution

**Input Validation**:
- All agent outputs validated with Zod
- Invalid events are rejected before rendering

## Related Decisions
- [ADR-001: Technology Stack](./ADR-001-technology-stack.md)
- [ADR-003: LangGraph ReAct Agent Pattern](./ADR-003-langgraph-agent.md)

## Future Enhancements

1. **Component Plugins**: Allow user-defined component types
2. **Animation Library**: More transition types (bounce, spin, etc.)
3. **Layout Engine**: Auto-layout for components
4. **Theme System**: Pre-defined color schemes and styles
5. **Component Templates**: Pre-built component combinations

## Date
2024-10-15

## Author
Initial project setup
